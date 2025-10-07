import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Estrutura esperada da tabela `department_meetings` no Supabase:
// - id: uuid (pk)
// - department_id: uuid (fk -> departments.id)
// - date: date
// - scheduled_time: text (HH:MM) opcional
// - done: boolean (default false)
// - done_at: timestamptz null
// - created_by: uuid (fk -> profiles.id) opcional
// Unique (department_id, date)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)
    const supabase = await createServerClient()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth?.user?.id
    const allowed = [
      'd4f6ea0c-0ddc-41a4-a6d4-163fea1916c3',
      'c8ee5614-8730-477e-ba59-db4cd8b83ce8',
      '02088194-3439-411d-bdfb-05a255d8be24',
    ]
    if (!userId || !allowed.includes(userId)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const sb = supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>

    const { data: rows, error } = await sb
      .from('department_meetings')
      .select('id, department_id, date, scheduled_time, done, done_at, no_meeting')
      .eq('date', date)

    if (error) {
      return NextResponse.json({ error: `Erro ao buscar reuniões: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ meetings: rows ?? [], date }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: `Erro interno do servidor: ${e?.message || e}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth?.user?.id
    const allowed = [
      'd4f6ea0c-0ddc-41a4-a6d4-163fea1916c3',
      'c8ee5614-8730-477e-ba59-db4cd8b83ce8',
      '02088194-3439-411d-bdfb-05a255d8be24',
    ]
    if (!userId || !allowed.includes(userId)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json() as {
      department_id: string
      date?: string
      scheduled_time?: string | null
      done?: boolean
      no_meeting?: boolean
    }

    if (!body?.department_id) {
      return NextResponse.json({ error: 'department_id é obrigatório' }, { status: 400 })
    }

    const sb = supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>

    const date = body.date || new Date().toISOString().slice(0, 10)
    const done = Boolean(body.done)
    const no_meeting = Boolean(body.no_meeting)
    const scheduled_time = typeof body.scheduled_time === 'string' ? body.scheduled_time : null

    // Capturar usuário autenticado para auditoria
    const { data: authUser } = await supabase.auth.getUser()
    const created_by = authUser?.user?.id ?? null

    // Upsert por (department_id, date)
    const { data, error } = await sb
      .from('department_meetings')
      .upsert({
        department_id: body.department_id,
        date,
        scheduled_time,
        done,
        done_at: done ? new Date().toISOString() : null,
        no_meeting,
        created_by,
      }, { onConflict: 'department_id,date' })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: `Erro ao salvar reunião: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ meeting: data }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: `Erro interno do servidor: ${e?.message || e}` }, { status: 500 })
  }
}


