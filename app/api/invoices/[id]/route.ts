import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
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

    const { id: invoiceId } = await params

    // Buscar a nota fiscal para verificar se pertence ao usuário
    const { data: invoice, error: fetchError } = await supabase
      .from('invoice_files')
      .select('*')
      .eq('id', invoiceId)
      .eq('employee_id', user.id)
      .single()

    if (fetchError || !invoice) {
      return NextResponse.json({ error: 'Nota fiscal não encontrada' }, { status: 404 })
    }

    // Deletar do storage
    if ((invoice as any).file_path) {
      const { error: storageError } = await supabase.storage
        .from('invoice-files')
        .remove([(invoice as any).file_path])

      if (storageError) {
        console.error('Erro ao deletar do storage:', storageError)
        // Continuar mesmo se houver erro no storage
      }
    }

    // Deletar do banco de dados
    const { error: dbError } = await supabase
      .from('invoice_files')
      .delete()
      .eq('id', invoiceId)
      .eq('employee_id', user.id)

    if (dbError) {
      console.error('Erro ao deletar do banco:', dbError)
      return NextResponse.json({ error: 'Erro ao deletar nota fiscal' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Nota fiscal deletada com sucesso' })
  } catch (error) {
    console.error('Erro na API de deletar nota fiscal:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

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

    const { id: invoiceId } = await params
    const body = await request.json()
    const { status, description } = body

    // Verificar se o usuário tem permissão para atualizar (admin ou manager)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'manager'].includes((profile as any).role)) {
      return NextResponse.json({ error: 'Sem permissão para atualizar status' }, { status: 403 })
    }

    // Atualizar a nota fiscal
    const updateData: any = {}
    if (status) updateData.status = status
    if (description !== undefined) updateData.description = description

    const { data: invoice, error: updateError } = await (supabase as any)
      .from('invoice_files')
      .update(updateData)
      .eq('id', invoiceId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar nota fiscal:', updateError)
      return NextResponse.json({ error: 'Erro ao atualizar nota fiscal' }, { status: 500 })
    }

    return NextResponse.json({ invoice })
  } catch (error) {
    console.error('Erro na API de atualizar nota fiscal:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
