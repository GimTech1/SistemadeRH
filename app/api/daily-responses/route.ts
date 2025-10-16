import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const department_id = searchParams.get('department_id')
    
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

    let query = (supabase as any)
      .from('daily_responses')
      .select(`
        id,
        question_id,
        employee_id,
        response,
        response_date,
        created_at,
        daily_questions!inner(
          id,
          question,
          department_id,
          departments(name)
        ),
        profiles!inner(
          id,
          full_name,
          email
        )
      `)

    // Se não for admin/manager, só pode ver suas próprias respostas
    if ((profile as any).role !== 'admin' && (profile as any).role !== 'manager') {
      query = query.eq('employee_id', user.id)
    }

    // Filtros opcionais
    if (date) {
      query = query.eq('response_date', date)
    }

    if (department_id) {
      query = query.eq('daily_questions.department_id', department_id)
    }

    const { data: responses, error: responsesError } = await query
      .order('created_at', { ascending: false })

    if (responsesError) {
      return NextResponse.json({ error: 'Erro ao buscar respostas' }, { status: 500 })
    }

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Erro na API daily-responses GET:', error)
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

    const body = await request.json()
    const { question_id, response, response_date } = body

    if (!question_id || !response?.trim()) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
    }

    const today = response_date || new Date().toISOString().split('T')[0]

    // Verificar se já existe resposta para hoje
    const { data: existingResponse } = await supabase
      .from('daily_responses')
      .select('id')
      .eq('question_id', question_id)
      .eq('employee_id', user.id)
      .eq('response_date', today)
      .single()

    let data, error

    if (existingResponse) {
      // Atualizar resposta existente
      const result = await (supabase as any)
        .from('daily_responses')
        .update({ response: response.trim() })
        .eq('id', (existingResponse as any).id)
        .select(`
          id,
          question_id,
          employee_id,
          response,
          response_date,
          created_at,
          daily_questions!inner(
            id,
            question,
            department_id,
            departments(name)
          )
        `)
        .single()
      
      data = result.data
      error = result.error
    } else {
      // Criar nova resposta
      const result = await (supabase as any)
        .from('daily_responses')
        .insert({
          question_id,
          employee_id: user.id,
          response: response.trim(),
          response_date: today
        })
        .select(`
          id,
          question_id,
          employee_id,
          response,
          response_date,
          created_at,
          daily_questions!inner(
            id,
            question,
            department_id,
            departments(name)
          )
        `)
        .single()
      
      data = result.data
      error = result.error
    }

    if (error) {
      return NextResponse.json({ error: 'Erro ao salvar resposta' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro na API daily-responses POST:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
