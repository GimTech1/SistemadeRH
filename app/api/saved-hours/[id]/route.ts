import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT - Atualizar registro
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
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
    if (hours_saved !== undefined && hours_saved < 0) {
      return NextResponse.json(
        { error: 'Horas economizadas não pode ser negativo' },
        { status: 400 }
      )
    }

    // Atualizar registro
    const updateData: any = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(type && { type }),
      ...(hours_saved !== undefined && { hours_saved: parseFloat(hours_saved) }),
      updated_at: new Date().toISOString(),
    }
    
    const supabaseQuery: any = supabase
    const { data, error } = await supabaseQuery
      .from('saved_hours')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar registro:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar registro' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro no PUT /api/saved-hours/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir registro
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params
    
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

    // Excluir registro
    const { error } = await supabase
      .from('saved_hours')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir registro:', error)
      return NextResponse.json(
        { error: 'Erro ao excluir registro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Registro excluído com sucesso' })
  } catch (error) {
    console.error('Erro no DELETE /api/saved-hours/[id]:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

