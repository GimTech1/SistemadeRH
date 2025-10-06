import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createServerClient()
    const { data, error } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
      .from('departments')
      .select('id, name, description, manager_id, parent_department_id, created_at, updated_at')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 404 })
    }

    // Buscar colaboradores vinculados ao departamento
    const { data: employees, error: employeesError } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
      .from('employees')
      .select('id, full_name, email, position, is_active, avatar_url')
      .eq('department', id)
      .order('full_name', { ascending: true })

    // Buscar nome do gerente (profiles)
    let manager: { id: string; full_name: string; email: string | null; role: string } | null = null
    if (data?.manager_id) {
      const { data: managerData } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', data.manager_id)
        .single()
      manager = managerData || null
    }

    // Buscar subdepartamentos
    const { data: children, error: childrenError } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
      .from('departments')
      .select('id, name, description')
      .eq('parent_department_id', id)
      .order('name', { ascending: true })

    // Buscar skills do departamento
    const { data: skills, error: skillsError } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
      .from('skills')
      .select('id, name, category, weight')
      .eq('department_id', id)
      .order('weight', { ascending: false })

    return NextResponse.json({
      department: data,
      employees: employeesError ? [] : employees,
      manager,
      children: childrenError ? [] : children,
      skills: skillsError ? [] : skills,
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json() as {
      name?: string
      description?: string | null
      manager_id?: string | null
      parent_department_id?: string | null
    }

    const supabase = await createServerClient()

    const baseUpdate: Record<string, any> = {
      ...(typeof body.name !== 'undefined' ? { name: body.name } : {}),
      ...(typeof body.description !== 'undefined' ? { description: body.description } : {}),
      ...(typeof body.manager_id !== 'undefined' ? { manager_id: body.manager_id } : {}),
      ...(typeof body.parent_department_id !== 'undefined' ? { parent_department_id: body.parent_department_id } : {}),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await (supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>)
      .from('departments')
      .update(baseUpdate as any)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ department: data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const supabase = await createServerClient()

    const { data: existing, error: fetchError } = await supabase
      .from('departments')
      .select('id, name')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Departamento não encontrado' },
        { status: 404 }
      )
    }

    const { error: deleteError } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Erro ao excluir departamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Departamento excluído com sucesso' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


