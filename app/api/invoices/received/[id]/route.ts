import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário é José ou Bianda
    const joseId = 'b8f68ba9-891c-4ca1-b765-43fee671928f'
    const biandaId = '2005804d-9527-4300-aaf5-720d36e080a5'
    
    if (user.id !== joseId && user.id !== biandaId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const invoiceId = params.id
    const body = await request.json()
    const { status } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    // Verificar se a nota fiscal é destinada ao usuário
    const { data: invoice, error: fetchError } = await supabase
      .from('invoice_files')
      .select('*')
      .eq('id', invoiceId)
      .eq('recipient_id', user.id)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Nota fiscal não encontrada' }, { status: 404 })
    }

    // Atualizar o status da nota fiscal
    const { data: updatedInvoice, error: updateError } = await supabase
      .from('invoice_files')
      .update({ status })
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
