import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

export async function GET() {
  try {
    const supabase = await createClient()
    const now = new Date()
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
    const bucketStart = new Date(now.getFullYear(), 0, 1)

    const { data: goals, error } = await (supabase as any)
      .from('goals')
      .select('id, target_date, is_completed, created_at, updated_at')
      .or(`and(created_at.gte.${bucketStart.toISOString()},created_at.lte.${endOfYear.toISOString()}),and(target_date.gte.${bucketStart.toISOString()},target_date.lte.${endOfYear.toISOString()})`)
    if (error) throw error

    const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
    const totalsByMonth: Record<string, number> = {}
    const completedByMonth: Record<string, number> = {}
    // Determinar até que mês devemos exibir: no mínimo mês atual; se houver metas em meses futuros, incluir até o maior
    let maxMonthIndex = now.getMonth()
    ;(goals || []).forEach((row: any) => {
      const prefDate = row.target_date ? new Date(row.target_date) : new Date(row.created_at)
      if (prefDate.getFullYear() === bucketStart.getFullYear()) {
        maxMonthIndex = Math.max(maxMonthIndex, prefDate.getMonth())
      }
    })
    const iterMonths: { key: string; label: string }[] = []
    for (let i = 0; i <= maxMonthIndex; i++) {
      const d = new Date(bucketStart.getFullYear(), i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      totalsByMonth[key] = 0
      completedByMonth[key] = 0
      iterMonths.push({ key, label: monthNames[d.getMonth()] })
    }

    ;(goals || []).forEach((row: any) => {
      // Totais do mês: prioriza target_date; se ausente, usa created_at
      const totalDate = row.target_date ? new Date(row.target_date) : new Date(row.created_at)
      const totalKey = `${totalDate.getUTCFullYear()}-${String(totalDate.getUTCMonth()+1).padStart(2,'0')}`
      if (totalsByMonth[totalKey] !== undefined) {
        totalsByMonth[totalKey] += 1
      }
      // Concluídas no mês: CONTABILIZA NO MÊS DO PRAZO (target_date); se não existir, cai para a mesma regra do total
      if (row.is_completed === true) {
        const completedDate = row.target_date ? new Date(row.target_date) : totalDate
        const completedKey = `${completedDate.getUTCFullYear()}-${String(completedDate.getUTCMonth()+1).padStart(2,'0')}`
        if (completedByMonth[completedKey] !== undefined) {
          completedByMonth[completedKey] += 1
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


