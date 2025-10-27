import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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
    const joseId = 'b8f68ba9-891c-4ca1-b765-43fee671928f'
    const biancaId = '0d0bf6c3-bda8-47a2-864b-425575d13194'
    const newAllowedId = '02088194-3439-411d-bdfb-05a255d8be24'
    const allowedIds = [joseId, biancaId, newAllowedId]
    
    if (!allowedIds.includes(user.id)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    // Buscar notas fiscais: se for o novo ID, retorna todas as recebidas; senão, apenas as destinadas ao usuário
    const baseQuery = supabase
      .from('invoice_files')
      .select(`
        *,
        sender:profiles!employee_id(full_name, position)
      `)
      .order('created_at', { ascending: false })

    const { data: invoices, error } = user.id === newAllowedId
      ? await baseQuery
      : await baseQuery.eq('recipient_id', user.id)

    // Se não encontrou notas com usuário normal, tentar com Service Role (bypass RLS)
    if ((!invoices || invoices.length === 0) && adminSupabase) {
      const { data: fallbackInvoices, error: fallbackError } = await adminSupabase
        .from('invoice_files')
        .select(`
          *,
          sender:profiles!employee_id(full_name, position)
        `)
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
      
      if (!fallbackError && fallbackInvoices && fallbackInvoices.length > 0) {
        return NextResponse.json({ invoices: fallbackInvoices })
      }
    }

    if (error) {
      console.error('❌ Erro ao buscar notas fiscais recebidas:', error)
      return NextResponse.json({ error: 'Erro ao buscar notas fiscais' }, { status: 500 })
    }

    return NextResponse.json({ invoices })
  } catch (error) {
    console.error('❌ Erro na API de notas fiscais recebidas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
