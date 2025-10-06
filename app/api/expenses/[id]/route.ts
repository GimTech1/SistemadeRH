import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const APPROVERS = [
  'b8f68ba9-891c-4ca1-b765-43fee671928f',
  '02088194-3439-411d-bdfb-05a255d8be24',
]

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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


