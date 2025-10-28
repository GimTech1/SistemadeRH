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

    // Buscar notas fiscais: se for o novo ID, retorna todas as recebidas; senão, apenas as destinadas ao usuário
    const baseQuery = supabase
      .from('invoice_files')
      .select(`
        *,
        sender:profiles!employee_id(full_name, position)
      `)
      .order('created_at', { ascending: false })

    let invoices, error

    if (user.id === newAllowedId) {
      // Usuário especial pode ver todas as notas fiscais
      const result = await baseQuery
      invoices = result.data
      error = result.error
    } else {
      // Usuários normais podem ver apenas notas fiscais enviadas para eles
      const result = await baseQuery.eq('recipient_id', user.id)
      invoices = result.data
      error = result.error
    }

    console.log('Busca de notas fiscais:', {
      userId: user.id,
      isSpecialUser: user.id === newAllowedId,
      invoicesFound: invoices?.length || 0,
      error: error?.message
    })

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
