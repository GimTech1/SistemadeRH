import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    // Buscar perguntas diárias
    const { data: questions, error: questionsError } = await supabase
      .from('daily_questions')
      .select(`
        id,
        department_id,
        question,
        is_active,
        created_at,
        updated_at,
        departments(name)
      `)
      .order('created_at', { ascending: false })

    if (questionsError) {
      return NextResponse.json({ error: 'Erro ao buscar perguntas' }, { status: 500 })
    }

    return NextResponse.json(questions)
  } catch (error) {
    console.error('Erro na API daily-questions GET:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
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
    const { department_id, question, is_active = true } = body

    if (!department_id || !question?.trim()) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Criar pergunta
    const { data, error } = await (supabase as any)
      .from('daily_questions')
      .insert({
        department_id,
        question: question.trim(),
        is_active
      })
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
      return NextResponse.json({ error: 'Erro ao criar pergunta' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro na API daily-questions POST:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
