import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const APPROVERS = process.env.EXPENSES_APPROVERS?.split(',') || []

if (APPROVERS.length === 0) {
  console.error('Variável de ambiente não configurada: EXPENSES_APPROVERS')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (APPROVERS.length === 0) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }
    
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    if (!APPROVERS.includes(user.id)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: 'approved' | 'rejected' }

    if (!['approved', 'rejected'].includes(String(status))) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
    }

    const updateData: any = { status }
    // registrar aprovador e data
    updateData.approved_by = user.id
    updateData.approved_at = new Date().toISOString()

    const { data: updated, error } = await (supabase as any)
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: 'Erro ao atualizar gasto' }, { status: 500 })
    }

    return NextResponse.json({ expense: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}


