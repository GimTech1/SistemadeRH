import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Database } from '@/lib/supabase/database.types'

const updateOneOnOneSchema = z.object({
  meeting_date: z.string().datetime().optional(),
  participants: z.array(z.string()).optional(),
  description: z.string().optional(),
  agreements: z.string().optional(),
  expected_date: z.string().datetime().optional(),
  manager_approved: z.boolean().optional(),
  employee_approved: z.boolean().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data, error } = await (supabase as any)
      .from('one_on_one_meetings')
      .select(`
        *,
        manager:profiles!one_on_one_meetings_manager_id_fkey(full_name, position),
        employee:profiles!one_on_one_meetings_employee_id_fkey(full_name, position)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Erro ao buscar reunião:', error)
      return NextResponse.json({ error: 'Reunião não encontrada' }, { status: 404 })
    }

    // Verificar se o usuário tem acesso à reunião
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile && (profile as any).role) {
      if ((profile as any).role === 'employee' && data.employee_id !== user.id) {
        return NextResponse.json({ error: 'Sem permissão para acessar esta reunião' }, { status: 403 })
      }

      if ((profile as any).role === 'gerente' && data.manager_id !== user.id && data.employee_id !== user.id) {
        return NextResponse.json({ error: 'Sem permissão para acessar esta reunião' }, { status: 403 })
      }
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateOneOnOneSchema.parse(body)

    // Buscar a reunião atual
    const { data: currentMeeting, error: fetchError } = await (supabase as any)
      .from('one_on_one_meetings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Reunião não encontrada' }, { status: 404 })
    }

    // Verificar permissões
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isManager = currentMeeting.manager_id === user.id
    const isEmployee = currentMeeting.employee_id === user.id
    const isAdmin = profile && (profile as any).role && (profile as any).role === 'admin'

    if (!isManager && !isEmployee && !isAdmin) {
      return NextResponse.json({ error: 'Sem permissão para editar esta reunião' }, { status: 403 })
    }

    // Apenas o manager pode aprovar como manager, e apenas o employee pode aprovar como employee
    if (validatedData.manager_approved !== undefined && !isManager && !isAdmin) {
      return NextResponse.json({ error: 'Apenas o manager pode aprovar como manager' }, { status: 403 })
    }

    if (validatedData.employee_approved !== undefined && !isEmployee && !isAdmin) {
      return NextResponse.json({ error: 'Apenas o employee pode aprovar como employee' }, { status: 403 })
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (validatedData.meeting_date !== undefined) updateData.meeting_date = validatedData.meeting_date
    if (validatedData.participants !== undefined) updateData.participants = validatedData.participants
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.agreements !== undefined) updateData.agreements = validatedData.agreements
    if (validatedData.expected_date !== undefined) updateData.expected_date = validatedData.expected_date
    if (validatedData.manager_approved !== undefined) updateData.manager_approved = validatedData.manager_approved
    if (validatedData.employee_approved !== undefined) updateData.employee_approved = validatedData.employee_approved
    if (validatedData.status !== undefined) updateData.status = validatedData.status

    const { data, error } = await (supabase as any)
      .from('one_on_one_meetings')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        manager:profiles!one_on_one_meetings_manager_id_fkey(full_name, position),
        employee:profiles!one_on_one_meetings_employee_id_fkey(full_name, position)
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar reunião:', error)
      return NextResponse.json({ error: 'Erro ao atualizar reunião' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dados inválidos', details: error.issues }, { status: 400 })
    }
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar a reunião atual
    const { data: currentMeeting, error: fetchError } = await (supabase as any)
      .from('one_on_one_meetings')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Reunião não encontrada' }, { status: 404 })
    }

    // Verificar permissões - apenas admin ou manager podem deletar
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isManager = currentMeeting.manager_id === user.id
    const isAdmin = profile && (profile as any).role && (profile as any).role === 'admin'

    if (!isManager && !isAdmin) {
      return NextResponse.json({ error: 'Sem permissão para deletar esta reunião' }, { status: 403 })
    }

    const { error } = await (supabase as any)
      .from('one_on_one_meetings')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao deletar reunião:', error)
      return NextResponse.json({ error: 'Erro ao deletar reunião' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Reunião deletada com sucesso' })
  } catch (error) {
    console.error('Erro na API:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
