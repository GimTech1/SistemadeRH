import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { process_id, flow_data } = body

    if (!process_id || !flow_data) {
      return NextResponse.json({ error: 'Dados obrigatórios não fornecidos' }, { status: 400 })
    }

    // Extrair departamentos dos nós do fluxo
    const processNodes = flow_data.nodes?.filter((node: any) => 
      node.type === 'process' && node.department_id
    ) || []

    if (processNodes.length === 0) {
      return NextResponse.json({ message: 'Nenhuma aprovação necessária' })
    }

    // Buscar gestores dos departamentos
    const departmentIds = processNodes.map((node: any) => node.department_id)
    
    const { data: managers, error: managersError } = await supabase
      .from('profiles')
      .select('id, department_id')
      .in('department_id', departmentIds)
      .in('role', ['admin', 'gerente'])
      .eq('is_active', true)

    if (managersError) {
      console.error('Erro ao buscar gestores:', managersError)
      return NextResponse.json({ error: 'Erro ao buscar gestores' }, { status: 500 })
    }

    // Criar aprovações para cada departamento
    const approvals: any[] = []
    
    for (const node of processNodes) {
      const manager = managers?.find((m: any) => m.department_id === node.department_id)
      
      if (manager) {
        const { data: approval, error: approvalError } = await (supabase as any)
          .from('process_approvals')
          .insert({
            process_id,
            department_id: node.department_id,
            manager_id: (manager as any).id,
            status: 'pending'
          })
          .select(`
            *,
            profiles!process_approvals_manager_id_fkey(full_name, email),
            departments!process_approvals_department_id_fkey(name)
          `)
          .single()

        if (approvalError) {
          console.error('Erro ao criar aprovação:', approvalError)
          continue
        }

        approvals.push(approval)
      }
    }

    return NextResponse.json({ 
      message: `${approvals.length} aprovações criadas`,
      approvals 
    })
  } catch (error) {
    console.error('Erro na API de criação de aprovações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
