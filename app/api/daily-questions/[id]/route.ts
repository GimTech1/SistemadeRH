import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createServerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem permissão (admin ou manager)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    if ((profile as any).role !== 'admin' && (profile as any).role !== 'manager') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { question, is_active } = body

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Pergunta não pode estar vazia' }, { status: 400 })
    }

    // Atualizar pergunta
    const { data, error } = await (supabase as any)
      .from('daily_questions')
      .update({
        question: question.trim(),
        is_active: is_active !== undefined ? is_active : true
      })
      .eq('id', id)
      .select(`
        id,
        department_id,
        question,
        is_active,
        created_at,
        updated_at,
        departments(name)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar pergunta' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Pergunta não encontrada' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na API daily-questions PUT:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createServerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem permissão (admin ou manager)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    if ((profile as any).role !== 'admin' && (profile as any).role !== 'manager') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    // Deletar pergunta
    const { error } = await (supabase as any)
      .from('daily_questions')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Erro ao deletar pergunta' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Pergunta deletada com sucesso' })
  } catch (error) {
    console.error('Erro na API daily-questions DELETE:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
