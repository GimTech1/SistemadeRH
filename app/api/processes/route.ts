import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter perfil do usuário para verificar role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role === 'admin' || profile?.role === 'gerente' ? 
      (profile.role === 'admin' ? 'admin' : 'manager') : 'employee'

    // Construir query baseada no role
    let query = supabase
      .from('processes')
      .select(`
        *,
        departments(name),
        profiles!processes_created_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false })

    // Se for employee, só mostrar processos públicos e publicados
    if (userRole === 'employee') {
      query = query.eq('is_public', true).eq('status', 'published')
    }

    const { data: processes, error } = await query

    if (error) {
      console.error('Erro ao buscar processos:', error)
      return NextResponse.json({ error: 'Erro ao buscar processos' }, { status: 500 })
    }

    return NextResponse.json({ processes })
  } catch (error) {
    console.error('Erro na API de processos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o usuário tem permissão para criar processos
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role === 'admin' || profile?.role === 'gerente' ? 
      (profile.role === 'admin' ? 'admin' : 'manager') : 'employee'

    if (userRole === 'employee') {
      return NextResponse.json({ error: 'Sem permissão para criar processos' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, department_id, is_public, flow_data } = body

    // Validações
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Título é obrigatório' }, { status: 400 })
    }

    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Categoria é obrigatória' }, { status: 400 })
    }

    // Criar processo
    const { data: process, error } = await supabase
      .from('processes')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        category: category.trim(),
        department_id: department_id || null,
        is_public: is_public !== false, // default true
        flow_data: flow_data || null,
        created_by: user.id,
        status: 'draft'
      })
      .select(`
        *,
        departments(name),
        profiles!processes_created_by_fkey(full_name)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar processo:', error)
      return NextResponse.json({ error: 'Erro ao criar processo' }, { status: 500 })
    }

    return NextResponse.json({ process }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de processos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
