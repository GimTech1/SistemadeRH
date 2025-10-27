import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Usuários com visão total dos gastos
const SUPER_VIEWER_IDS = process.env.SUPER_EXPENSES_IDS?.split(',') || []

if (SUPER_VIEWER_IDS.length === 0) {
  console.error('Variável de ambiente não configurada: SUPER_EXPENSES_IDS')
}

export async function GET(request: NextRequest) {
  try {
    if (SUPER_VIEWER_IDS.length === 0) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Carrega perfil para obter role e departamento
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, department_id')
      .eq('id', user.id)
      .single<{ role: 'admin' | 'gerente' | 'employee'; department_id: string | null }>()

    // Construção de filtros via query params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const departmentId = searchParams.get('department_id')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const q = searchParams.get('q')
    const minAmount = searchParams.get('min_amount')
    const maxAmount = searchParams.get('max_amount')

    let query = supabase
      .from('expenses')
      .select(`
        *,
        department:departments!department_id(id, name)
      `)
      .order('date', { ascending: false })

    // Escopo por permissão
    if (!SUPER_VIEWER_IDS.includes(user.id)) {
      // super viewer vê tudo; demais são restringidos
      if (profile?.role === 'admin') {
        // admin vê tudo
      } else if (profile?.role === 'gerente') {
        if (profile?.department_id) {
          query = query.eq('department_id', profile.department_id)
        } else {
          return NextResponse.json({ expenses: [] })
        }
      } else {
        return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
      }
    }

    // Filtros opcionais
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    if (departmentId) query = query.eq('department_id', departmentId)
    if (category) query = query.ilike('category', `%${category}%`)
    if (minAmount) query = query.gte('amount', Number(minAmount))
    if (maxAmount) query = query.lte('amount', Number(maxAmount))
    if (status) query = query.eq('status', status)
    if (q) {
      // simples busca por título/descrição
      query = query.or(
        `title.ilike.%${q}%,description.ilike.%${q}%`
      ) as any
    }

    const { data: expenses, error } = await query
    if (error) {
      return NextResponse.json({ error: 'Erro ao carregar gastos' }, { status: 500 })
    }

    return NextResponse.json({ expenses })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, amount, quantity, total, date, category } = body as {
      title: string
      description?: string
      amount: number
      quantity: number
      total: number
      date: string
      category?: string
    }

    if (!title || !amount || !date) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    // Perfil para validar papel e setor do gerente
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, department_id')
      .eq('id', user.id)
      .single<{ role: 'admin' | 'gerente' | 'employee'; department_id: string | null }>()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'gerente')) {
      return NextResponse.json({ error: 'Apenas administradores ou gerentes podem cadastrar gastos' }, { status: 403 })
    }

    const departmentId = profile.department_id
    if (!departmentId) {
      return NextResponse.json({ error: 'Gerente sem departamento vinculado' }, { status: 400 })
    }

    const insertPayload = {
      title,
      description: description ?? null,
      amount,
      quantity: quantity || 1,
      total: total || (amount * (quantity || 1)),
      date,
      category: category ?? null,
      department_id: departmentId,
      created_by: user.id,
      created_at: new Date().toISOString(),
      status: 'pending'
    }

    const { data: created, error: insertError } = await (supabase as any)
      .from('expenses')
      .insert(insertPayload)
      .select('*')
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Erro ao cadastrar gasto' }, { status: 500 })
    }

    return NextResponse.json({ expense: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


