import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Buscar estatísticas de horas economizadas
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar se o usuário pertence ao departamento de Tecnologia
    const profileResult = await supabase
      .from('profiles')
      .select('department_id')
      .eq('id', user.id)
      .single()
    
    const profile = profileResult.data as any
    
    if (!profile || !profile.department_id) {
      return NextResponse.json(
        { error: 'Acesso negado. Esta página é exclusiva do departamento de Tecnologia.' },
        { status: 403 }
      )
    }

    // Buscar nome do departamento
    const deptResult = await supabase
      .from('departments')
      .select('name')
      .eq('id', profile.department_id)
      .single()
    
    const dept = deptResult.data as any
    
    if (!dept || dept.name !== 'Tecnologia') {
      return NextResponse.json(
        { error: 'Acesso negado. Esta página é exclusiva do departamento de Tecnologia.' },
        { status: 403 }
      )
    }

    // Buscar todos os registros
    const { data: allRecords, error } = await supabase
      .from('saved_hours')
      .select('*')

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar estatísticas' },
        { status: 500 }
      )
    }

    // Calcular estatísticas
    const records = (allRecords || []) as any[]
    const totalHours = records.reduce((sum, record) => sum + record.hours_saved, 0)
    const totalRecords = records.length

    // Agrupar por tipo
    const byType = records.reduce((acc, record) => {
      if (!acc[record.type]) {
        acc[record.type] = { count: 0, hours: 0 }
      }
      acc[record.type].count++
      acc[record.type].hours += record.hours_saved
      return acc
    }, {} as Record<string, { count: number; hours: number }>)

    // Agrupar por mês
    const byMonth = records.reduce((acc, record) => {
      const date = new Date(record.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!acc[monthKey]) {
        acc[monthKey] = { count: 0, hours: 0 }
      }
      acc[monthKey].count++
      acc[monthKey].hours += record.hours_saved
      return acc
    }, {} as Record<string, { count: number; hours: number }>)

    // Ordenar meses
    const monthsData = Object.entries(byMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, monthData]: [string, any]) => ({
        month,
        count: monthData.count,
        hours: monthData.hours,
      }))

    return NextResponse.json({
      totalHours,
      totalRecords,
      byType,
      byMonth: monthsData,
    })
  } catch (error) {
    console.error('Erro no GET /api/saved-hours/stats:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

