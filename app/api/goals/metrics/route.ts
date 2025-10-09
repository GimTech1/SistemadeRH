import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const now = new Date()
    const end = now
    const bucketStart = new Date(now.getFullYear(), 0, 1)
    const monthsToShow = now.getMonth() + 1

    const { data: goals, error } = await (supabase as any)
      .from('goals')
      .select('id, target_date, is_completed, created_at, updated_at')
      .gte('created_at', bucketStart.toISOString())
      .lte('created_at', end.toISOString())
    if (error) throw error

    const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const totalsByMonth: Record<string, number> = {}
    const completedByMonth: Record<string, number> = {}
    const iterMonths: { key: string; label: string }[] = []
    for (let i = 0; i < monthsToShow; i++) {
      const d = new Date(bucketStart.getFullYear(), bucketStart.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      totalsByMonth[key] = 0
      completedByMonth[key] = 0
      iterMonths.push({ key, label: monthNames[d.getMonth()] })
    }

    ;(goals || []).forEach((row: any) => {
      // Total por mês: metas criadas no mês
      const when = new Date(row.created_at)
      const key = `${when.getFullYear()}-${String(when.getMonth()+1).padStart(2,'0')}`
      if (totalsByMonth[key] !== undefined) {
        totalsByMonth[key] += 1
      }
      // Concluídas no mês: usa updated_at (fallback para created_at) quando is_completed = true
      if (row.is_completed === true) {
        const doneAtSrc = row.updated_at || row.created_at
        const doneAt = new Date(doneAtSrc)
        const doneKey = `${doneAt.getFullYear()}-${String(doneAt.getMonth()+1).padStart(2,'0')}`
        if (completedByMonth[doneKey] !== undefined) {
          completedByMonth[doneKey] += 1
        }
      }
    })

    const monthlyData = iterMonths.map(m => {
      const total = totalsByMonth[m.key] || 0
      const completed = completedByMonth[m.key] || 0
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0
      return { key: m.key, month: m.label, value: pct, target: 100, total, completed }
    })

    // totalGoals geral
    const { count: totalGoals } = await (supabase as any)
      .from('goals')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({ monthlyData, totalGoals: totalGoals || 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro' }, { status: 500 })
  }
}


