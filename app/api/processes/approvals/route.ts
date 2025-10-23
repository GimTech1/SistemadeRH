import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const processId = searchParams.get('process_id')

    if (!processId) {
      return NextResponse.json({ error: 'ID do processo é obrigatório' }, { status: 400 })
    }

    // Buscar aprovações do processo
    const { data: approvals, error } = await supabase
      .from('process_approvals')
      .select(`
        *,
        profiles!process_approvals_manager_id_fkey(full_name, email),
        departments!process_approvals_department_id_fkey(name)
      `)
      .eq('process_id', processId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar aprovações:', error)
      return NextResponse.json({ error: 'Erro ao buscar aprovações' }, { status: 500 })
    }

    return NextResponse.json({ approvals })
  } catch (error) {
    console.error('Erro na API de aprovações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { process_id, department_id, manager_id, status, comments, approval_id } = body

    // Validações
    if (!process_id || !department_id) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    // Verificar se o usuário é o gestor do departamento
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, department_id')
      .eq('id', user.id)
      .single()

    if (!profile || ((profile as any).role !== 'admin' && (profile as any).role !== 'gerente')) {
      return NextResponse.json({ error: 'Sem permissão para aprovar processos' }, { status: 403 })
    }

    // Se não for admin, verificar se é gestor do departamento
    if ((profile as any).role === 'gerente' && (profile as any).department_id !== department_id) {
      return NextResponse.json({ error: 'Sem permissão para aprovar este processo' }, { status: 403 })
    }

    // Se for uma atualização de aprovação existente
    if (approval_id) {
      const { data: approval, error } = await (supabase as any)
        .from('process_approvals')
        .update({
          status,
          comments: comments || null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          rejected_at: status === 'rejected' ? new Date().toISOString() : null
        })
        .eq('id', approval_id)
        .select(`
          *,
          profiles!process_approvals_manager_id_fkey(full_name, email),
          departments!process_approvals_department_id_fkey(name)
        `)
        .single()

      if (error) {
        console.error('Erro ao atualizar aprovação:', error)
        return NextResponse.json({ error: 'Erro ao processar aprovação' }, { status: 500 })
      }

      return NextResponse.json({ approval })
    }

    // Criar nova aprovação
    const { data: approval, error } = await (supabase as any)
      .from('process_approvals')
      .upsert({
        process_id,
        department_id,
        manager_id: manager_id || user.id,
        status,
        comments: comments || null,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
        rejected_at: status === 'rejected' ? new Date().toISOString() : null
      }, {
        onConflict: 'process_id,department_id'
      })
      .select(`
        *,
        profiles!process_approvals_manager_id_fkey(full_name, email),
        departments!process_approvals_department_id_fkey(name)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar/atualizar aprovação:', error)
      return NextResponse.json({ error: 'Erro ao processar aprovação' }, { status: 500 })
    }

    return NextResponse.json({ approval }, { status: 201 })
  } catch (error) {
    console.error('Erro na API de aprovações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
