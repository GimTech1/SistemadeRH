import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    
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
      console.error('Erro ao buscar nota fiscal:', fetchError)
      console.error('Invoice ID:', invoiceId)
      console.error('User ID:', user.id)
      console.error('Allowed IDs:', allowedIds)
      return NextResponse.json({ error: 'Nota fiscal não encontrada' }, { status: 404 })
    }

    // Atualizar o status da nota fiscal e/ou pagamento
    const updatePayload: Record<string, any> = {}
    if (status) updatePayload.status = status
    if (payment_status) {
      updatePayload.payment_status = payment_status
      updatePayload.paid_at = payment_status === 'paid' ? new Date().toISOString() : null
    }

    const { data: updatedInvoice, error: updateError } = await (supabase as any)
      .from('invoice_files')
      .update(updatePayload)
      .eq('id', invoiceId)
      .select(`
        *,
        sender:profiles!employee_id(full_name, position)
      `)
      .single()

    if (updateError) {
      console.error('Erro ao atualizar nota fiscal:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar nota fiscal' }, { status: 500 })
    }

    return NextResponse.json({ invoice: updatedInvoice })
  } catch (error) {
    console.error('Erro na API de atualizar nota fiscal recebida:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
