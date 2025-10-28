import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
    // Preparar Service Role para fallback em caso de políticas RLS
    let adminSupabase = null
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
    }
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário está autorizado a acessar recebidas
    const joseId = process.env.JOSE_ID
    const biancaId = process.env.BIANCA_ID
    const newAllowedId = process.env.NEW_ALLOWED_ID
    
    if (!joseId || !biancaId || !newAllowedId) {
      console.error('Variáveis de ambiente não configuradas: JOSE_ID, BIANCA_ID, NEW_ALLOWED_ID')
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }
    
    const allowedIds = [joseId, biancaId, newAllowedId]
    
    if (!allowedIds.includes(user.id)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id: invoiceId } = await params
    const body = await request.json()
    const { status, payment_status } = body

    if (
      (status && !['approved', 'rejected'].includes(status)) ||
      (payment_status && !['pending', 'paid'].includes(payment_status))
    ) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    // Verificar se a nota fiscal existe e se o usuário pode atualizá-la
    const baseFetch = supabase
      .from('invoice_files')
      .select('*')
      .eq('id', invoiceId)

    let invoice, fetchError

    if (user.id === newAllowedId) {
      // Usuário especial pode ver todas as notas fiscais
      const result = await baseFetch.single()
      invoice = result.data
      fetchError = result.error
    } else {
      // Usuários normais podem ver apenas notas fiscais enviadas para eles
      const result = await baseFetch.eq('recipient_id', user.id).single()
      invoice = result.data
      fetchError = result.error
    }

    if (fetchError || !invoice) {
      // Se não encontrou com usuário normal, tentar com Service Role (bypass RLS)
      if ((!invoice) && adminSupabase) {
        const adminResult = await adminSupabase
          .from('invoice_files')
          .select('*')
          .eq('id', invoiceId)
          .single()
        
        if (adminResult.data) {
          // Verificar se o usuário tem permissão para esta nota fiscal
          const noteRecipientId = adminResult.data.recipient_id
          
          if (noteRecipientId === user.id || user.id === newAllowedId) {
            invoice = adminResult.data
            fetchError = null
          } else {
            return NextResponse.json({ error: 'Acesso negado a esta nota fiscal' }, { status: 403 })
          }
        }
      }
      
      if (!invoice) {
        return NextResponse.json({ error: 'Nota fiscal não encontrada' }, { status: 404 })
      }
    }

    // Atualizar o status da nota fiscal e/ou pagamento
    const updatePayload: Record<string, any> = {}
    if (status) updatePayload.status = status
    if (payment_status) {
      updatePayload.payment_status = payment_status
      updatePayload.paid_at = payment_status === 'paid' ? new Date().toISOString() : null
    }

    let updatedInvoice, updateError

    // Se encontramos a nota via Service Role, usar Service Role para atualizar também
    if (adminSupabase && fetchError) {
      // Primeiro, tentar atualização simples sem join
      const simpleResult = await adminSupabase
        .from('invoice_files')
        .update(updatePayload)
        .eq('id', invoiceId)
        .select('*')
        .single()
      
      if (simpleResult.data) {
        // Se a atualização simples funcionou, buscar com join
        const joinResult = await adminSupabase
          .from('invoice_files')
          .select(`
            *,
            sender:profiles!employee_id(full_name, position)
          `)
          .eq('id', invoiceId)
          .single()
        
        updatedInvoice = joinResult.data
        updateError = joinResult.error
      } else {
        updatedInvoice = simpleResult.data
        updateError = simpleResult.error
      }
    } else {
      const result = await (supabase as any)
        .from('invoice_files')
        .update(updatePayload)
        .eq('id', invoiceId)
        .select(`
          *,
          sender:profiles!employee_id(full_name, position)
        `)
        .single()
      
      updatedInvoice = result.data
      updateError = result.error
    }

    if (updateError) {
      // Última tentativa: atualização sem join, depois buscar separadamente
      if (adminSupabase) {
        try {
          // Atualização simples sem join
          const simpleUpdate = await adminSupabase
            .from('invoice_files')
            .update(updatePayload)
            .eq('id', invoiceId)
          
          if (!simpleUpdate.error) {
            // Buscar dados atualizados com join
            const finalResult = await adminSupabase
              .from('invoice_files')
              .select(`
                *,
                sender:profiles!employee_id(full_name, position)
              `)
              .eq('id', invoiceId)
              .single()
            
            if (finalResult.data) {
              return NextResponse.json({ invoice: finalResult.data })
            }
          }
        } catch (simpleError) {
          console.error('Erro na atualização simples:', simpleError)
        }
      }
      
      console.error('Erro ao atualizar nota fiscal:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar nota fiscal' }, { status: 500 })
    }

    return NextResponse.json({ invoice: updatedInvoice })
  } catch (error) {
    console.error('Erro na API de atualizar nota fiscal recebida:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
