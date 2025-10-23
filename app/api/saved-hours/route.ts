import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar todos os registros de horas economizadas
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário pertence ao departamento de Tecnologia
    const profileResult = await supabase
      .from('profiles')
      .select('department_id')
      .eq('id', user.id)
      .single()
    
    const profile = profileResult.data as any
    
    if (!profile || !profile.department_id) {
      return NextResponse.json(
        { error: 'Acesso negado. Esta página é exclusiva do departamento de Tecnologia.' },
        { status: 403 }
      )
    }

    // Buscar nome do departamento
    const deptResult = await supabase
      .from('departments')
      .select('name')
      .eq('id', profile.department_id)
      .single()
    
    const dept = deptResult.data as any
    
    if (!dept || dept.name !== 'Tecnologia') {
      return NextResponse.json(
        { error: 'Acesso negado. Esta página é exclusiva do departamento de Tecnologia.' },
        { status: 403 }
      )
    }

    // Buscar registros de horas economizadas (sem join para evitar erro de schema)
    const { data, error } = await supabase
      .from('saved_hours')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar horas economizadas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar horas economizadas', details: error.message },
        { status: 500 }
      )
    }
    
    // Buscar informações dos criadores separadamente
    if (data && data.length > 0) {
      const creatorIds = [...new Set(data.map((r: any) => r.created_by))]
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', creatorIds)
      
      // Mapear perfis aos registros
      const profilesMap = new Map(profiles?.map((p: any) => [p.id, p]) || [])
      const enrichedData = data.map((record: any) => ({
        ...record,
        profiles: profilesMap.get(record.created_by) || null
      }))
      
      return NextResponse.json(enrichedData)
    }
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Erro no GET /api/saved-hours:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo registro de horas economizadas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário pertence ao departamento de Tecnologia
    const profileResult = await supabase
      .from('profiles')
      .select('department_id')
      .eq('id', user.id)
      .single()
    
    const profile = profileResult.data as any
    
    if (!profile || !profile.department_id) {
      return NextResponse.json(
        { error: 'Acesso negado. Esta página é exclusiva do departamento de Tecnologia.' },
        { status: 403 }
      )
    }

    // Buscar nome do departamento
    const deptResult = await supabase
      .from('departments')
      .select('name')
      .eq('id', profile.department_id)
      .single()
    
    const dept = deptResult.data as any
    
    if (!dept || dept.name !== 'Tecnologia') {
      return NextResponse.json(
        { error: 'Acesso negado. Esta página é exclusiva do departamento de Tecnologia.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, type, hours_saved } = body

    // Validações
    if (!title || !type || hours_saved === undefined) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: título, tipo e horas economizadas' },
        { status: 400 }
      )
    }

    if (hours_saved < 0) {
      return NextResponse.json(
        { error: 'Horas economizadas não pode ser negativo' },
        { status: 400 }
      )
    }

    // Criar registro
    const { data, error } = await supabase
      .from('saved_hours')
      .insert({
        title,
        description: description || null,
        type,
        hours_saved: parseFloat(hours_saved),
        created_by: user.id,
      } as any)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar registro:', error)
      return NextResponse.json(
        { error: 'Erro ao criar registro de horas economizadas' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro no POST /api/saved-hours:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

