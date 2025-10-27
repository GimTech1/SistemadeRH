import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)
    const supabase = await createServerClient()
    const { data: auth } = await supabase.auth.getUser()
    const userId = auth?.user?.id
    
    const allowedIds = process.env.ALLOWED_MEETINGS_IDS?.split(',') || []
    
    if (allowedIds.length === 0) {
      console.error('Variável de ambiente não configurada: ALLOWED_MEETINGS_IDS')
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }
    
    if (!userId || !allowedIds.includes(userId)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const sb = supabase as unknown as import('@supabase/supabase-js').SupabaseClient<any>

    const { data: rows, error } = await sb
      .from('department_meetings')
      .select('id, department_id, date, scheduled_time, done, done_at, no_meeting, notes, quality, metrics')
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
    
    const allowedIds = process.env.ALLOWED_MEETINGS_IDS?.split(',') || []
    
    if (allowedIds.length === 0) {
      console.error('Variável de ambiente não configurada: ALLOWED_MEETINGS_IDS')
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 })
    }
    
    if (!userId || !allowedIds.includes(userId)) {
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

    // Se vierem métricas, calcular qualidade automaticamente (média 1–5, arredondada)
    const incomingMetrics = (body as any).metrics as Record<string, unknown> | null | undefined
    let computedQuality: number | null = null
    let metricsToSave: Record<string, any> | null = null
    if (incomingMetrics && typeof incomingMetrics === 'object') {
      const numericEntries = Object.entries(incomingMetrics)
        .filter(([k, v]) => typeof v === 'number' && (k === 'objetivos' || k === 'decisoes' || k === 'followups' || k === 'satisfacao')) as Array<[string, number]>
      if (numericEntries.length > 0) {
        const sum = numericEntries.reduce((acc, [, v]) => acc + v, 0)
        const avg = sum / numericEntries.length
        computedQuality = Math.round(avg)
      }
      // salvar tudo (booleanos e numéricos)
      metricsToSave = incomingMetrics as any
    }

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
        notes: typeof (body as any).notes === 'string' ? (body as any).notes : null,
        quality: computedQuality !== null
          ? computedQuality
          : (typeof (body as any).quality === 'number' ? (body as any).quality : null),
        metrics: metricsToSave,
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


