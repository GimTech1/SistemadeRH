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

    return NextResponse.json({ department: data }, { status: 200 })
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
      console.error('Error updating department:', error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ department: data }, { status: 200 })
  } catch (error: any) {
    console.error('Unexpected error:', error)
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
      console.error('Erro ao excluir departamento:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao excluir departamento' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Departamento excluído com sucesso' }, { status: 200 })
  } catch (error) {
    console.error('Erro no endpoint DELETE department:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


