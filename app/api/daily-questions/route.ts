import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
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

    // Buscar perguntas diárias (opcionalmente filtrando por data através de respostas existentes)
    let query = (supabase as any)
      .from('daily_questions')
      .select(`
        id,
        department_id,
        question,
        question_type,
        options,
        is_active,
        created_at,
        updated_at,
        departments(name)
        ${date ? `, daily_responses!inner(id,response_date)` : ''}
      `)
      .order('created_at', { ascending: false })

    if (date) {
      query = query.eq('daily_responses.response_date', date)
    }

    const { data: questions, error: questionsError } = await query

    if (questionsError) {
      return NextResponse.json({ error: 'Erro ao buscar perguntas' }, { status: 500 })
    }

    // Remover payload de join quando houver filtro por data
    const sanitized = (questions || []).map((q: any) => {
      if (date) {
        const { daily_responses, ...rest } = q
        return rest
      }
      return q
    })

    return NextResponse.json(sanitized)
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
    const { department_id, question, question_type = 'text', options = null, is_active = true } = body

    if (!department_id || !question?.trim()) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    // Validação para perguntas de múltipla escolha
    if (question_type === 'multiple_choice' && (!options || !Array.isArray(options) || options.length < 2)) {
      return NextResponse.json({ error: 'Perguntas de múltipla escolha devem ter pelo menos 2 opções' }, { status: 400 })
    }

    // Criar pergunta
    const { data, error } = await (supabase as any)
      .from('daily_questions')
      .insert({
        department_id,
        question: question.trim(),
        question_type,
        options,
        is_active
      })
      .select(`
        id,
        department_id,
        question,
        question_type,
        options,
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
