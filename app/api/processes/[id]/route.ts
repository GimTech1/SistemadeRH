import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: process, error } = await supabase
      .from('processes')
      .select(`
        *,
        departments(name),
        profiles!processes_created_by_fkey(full_name)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Erro ao buscar processo:', error)
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
    }

    // Verificar se o usuário tem acesso ao processo
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role === 'admin' || profile?.role === 'gerente' ? 
      (profile.role === 'admin' ? 'admin' : 'manager') : 'employee'

    // Se for employee, só pode ver processos públicos e publicados
    if (userRole === 'employee' && (!process.is_public || process.status !== 'published')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    return NextResponse.json({ process })
  } catch (error) {
    console.error('Erro na API de processo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o processo existe
    const { data: existingProcess, error: fetchError } = await supabase
      .from('processes')
      .select('created_by')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingProcess) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
    }

    // Verificar permissões
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role === 'admin' || profile?.role === 'gerente' ? 
      (profile.role === 'admin' ? 'admin' : 'manager') : 'employee'

    // Só admin ou o criador pode editar
    if (userRole !== 'admin' && existingProcess.created_by !== user.id) {
      return NextResponse.json({ error: 'Sem permissão para editar este processo' }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, category, department_id, is_public, flow_data, status } = body

    // Validações
    if (title && !title.trim()) {
      return NextResponse.json({ error: 'Título não pode ser vazio' }, { status: 400 })
    }

    if (category && !category.trim()) {
      return NextResponse.json({ error: 'Categoria não pode ser vazia' }, { status: 400 })
    }

    // Atualizar processo
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (category !== undefined) updateData.category = category.trim()
    if (department_id !== undefined) updateData.department_id = department_id
    if (is_public !== undefined) updateData.is_public = is_public
    if (flow_data !== undefined) updateData.flow_data = flow_data
    if (status !== undefined) updateData.status = status

    const { data: process, error } = await supabase
      .from('processes')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        departments(name),
        profiles!processes_created_by_fkey(full_name)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar processo:', error)
      return NextResponse.json({ error: 'Erro ao atualizar processo' }, { status: 500 })
    }

    return NextResponse.json({ process })
  } catch (error) {
    console.error('Erro na API de processo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se o processo existe
    const { data: existingProcess, error: fetchError } = await supabase
      .from('processes')
      .select('created_by')
      .eq('id', params.id)
      .single()

    if (fetchError || !existingProcess) {
      return NextResponse.json({ error: 'Processo não encontrado' }, { status: 404 })
    }

    // Verificar permissões
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role === 'admin' || profile?.role === 'gerente' ? 
      (profile.role === 'admin' ? 'admin' : 'manager') : 'employee'

    // Só admin ou o criador pode excluir
    if (userRole !== 'admin' && existingProcess.created_by !== user.id) {
      return NextResponse.json({ error: 'Sem permissão para excluir este processo' }, { status: 403 })
    }

    // Excluir processo
    const { error } = await supabase
      .from('processes')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir processo:', error)
      return NextResponse.json({ error: 'Erro ao excluir processo' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Processo excluído com sucesso' })
  } catch (error) {
    console.error('Erro na API de processo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
