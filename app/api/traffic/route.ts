import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type PaidTrafficDaily = {
  date: string
  spent: number
  meetings_scheduled: number
  meetings_held: number
  mother_contacts: number
  first_op: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const { date, spent, meetingsScheduled, meetingsHeld, motherContacts, firstOp } = body || {}
    if (!date) return NextResponse.json({ error: 'Campo "date" é obrigatório (YYYY-MM-DD)' }, { status: 400 })

    const payload: PaidTrafficDaily = {
      date,
      spent: Number(spent || 0),
      meetings_scheduled: Number(meetingsScheduled || 0),
      meetings_held: Number(meetingsHeld || 0),
      mother_contacts: Number(motherContacts || 0),
      first_op: Number(firstOp || 0),
    }

    const { error } = await supabase
      .from('paid_traffic_daily' as any)
      .upsert(payload as any, { onConflict: 'date' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Erro em POST /api/traffic:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}


