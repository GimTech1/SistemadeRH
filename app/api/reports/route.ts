import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Preparar Service Role para consultas que não devem ser bloqueadas por RLS
    let adminSupabase: any = null
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js')
      adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
    }
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Obter parâmetros de filtro
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const departmentId = searchParams.get('department_id')
    const reportType = searchParams.get('type') || 'overview'
    const limitParam = searchParams.get('limit') || 'default'

    // Calcular datas baseadas no período
    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Buscar dados baseados no tipo de relatório
    switch (reportType) {
      case 'overview':
        return await getOverviewData(supabase, startDate, endDate, departmentId, limitParam)
      case 'performance':
        return await getPerformanceData(supabase, startDate, endDate, departmentId)
      case 'cha':
        return await getCHAData(supabase, startDate, endDate, departmentId)
      case 'goals':
        return await getGoalsData(supabase, startDate, endDate, departmentId)
      case 'departments':
        return await getDepartmentsData(supabase, startDate, endDate, departmentId)
      case 'traffic':
        {
          const startParam = searchParams.get('start')
          const endParam = searchParams.get('end')
          const s = startParam ? new Date(startParam) : startDate
          const e = endParam ? new Date(endParam) : endDate
          const queryClient = (adminSupabase as any) || (supabase as any)
          return await getTrafficData(queryClient, s, e)
        }
      default:
        return await getOverviewData(supabase, startDate, endDate, departmentId, limitParam)
    }
  } catch (error) {
    console.error('Erro na API de relatórios:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

async function getOverviewData(supabase: any, startDate: Date, endDate: Date, departmentId?: string | null, limitParam: string = 'default') {
  try {
    // Buscar departamentos
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .order('name')

    // Buscar funcionários por departamento
    let employeesQuery = supabase
      .from('employees')
      .select('id, full_name, department, is_active')
      .eq('is_active', true)
    if (departmentId) {
      employeesQuery = (employeesQuery as any).eq('department', departmentId)
    }
    const { data: employees } = await employeesQuery

    // Buscar avaliações recentes
    let evaluationsQuery = supabase
      .from('evaluations')
      .select(`
        id, overall_score, created_at,
        employee:employee_id (id, full_name, department_id)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('overall_score', 'is', null)
    if (departmentId) {
      evaluationsQuery = (evaluationsQuery as any).eq('employee.department_id', departmentId)
    }
    const { data: evaluations } = await evaluationsQuery

    // Calcular distribuição por departamento
    const departmentDistribution = departments?.map((dept: any) => {
      const deptEmployees = employees?.filter((emp: any) => emp.department === dept.id) || []
      return {
        name: dept.name,
        value: deptEmployees.length,
        fill: getDepartmentColor(dept.name)
      }
    }) || []

    // Calcular performance por departamento
    const performanceData = departments?.map((dept: any) => {
      const deptEvaluations = evaluations?.filter((evaluation: any) => 
        evaluation.employee?.department_id === dept.id
      ) || []
      
      const avgScore = deptEvaluations.length > 0 
        ? deptEvaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.overall_score || 0), 0) / deptEvaluations.length
        : 0

      return {
        department: dept.name,
        score: Math.round(avgScore * 10) / 10,
        evaluations: deptEvaluations.length
      }
    }) || []

    // Mapa id -> nome de departamento
    const deptNames = departments?.reduce((acc: any, dept: any) => {
      acc[dept.id] = dept.name
      return acc
    }, {} as Record<string, string>) || {}

    // Top performers (com nome real do departamento)
    let topPerformers = evaluations
      ?.filter((evaluation: any) => evaluation.overall_score && evaluation.employee)
      .sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0))
      .map((evaluation: any) => ({
        name: evaluation.employee?.full_name || 'N/A',
        score: evaluation.overall_score,
        department: deptNames[evaluation.employee?.department_id || ''] || 'N/A'
      })) || []

    if (limitParam !== 'all') {
      topPerformers = topPerformers.slice(0, 5)
    }

    // Tendência mensal de performance (timeseries), similar a getPerformanceData
    const monthlyData: Record<string, Record<string, number[]>> = {}
    evaluations?.forEach((evaluation: any) => {
      const date = new Date(evaluation.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const deptId = evaluation.employee?.department_id || 'unknown'
      if (!monthlyData[monthKey]) monthlyData[monthKey] = {}
      if (!monthlyData[monthKey][deptId]) monthlyData[monthKey][deptId] = []
      monthlyData[monthKey][deptId].push(evaluation.overall_score || 0)
    })

    const performanceTrend = Object.keys(monthlyData).sort().map(month => {
      const data: any = { month: formatMonth(month) }
      Object.keys(monthlyData[month]).forEach(deptId => {
        const scores = monthlyData[month][deptId]
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
        const deptName = deptNames[deptId] || deptId
        data[deptName.toLowerCase().replace(/\s+/g, '_')] = Math.round(avgScore * 10) / 10
      })
      return data
    })

    // debug removido

    return NextResponse.json({
      departmentDistribution,
      performanceData,
      performanceTrend,
      topPerformers,
      totalEmployees: employees?.length || 0,
      totalEvaluations: evaluations?.length || 0
    })
  } catch (error) {
    console.error('Erro ao buscar dados de overview:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados de overview' }, { status: 500 })
  }
}

async function getPerformanceData(supabase: any, startDate: Date, endDate: Date, departmentId?: string | null) {
  try {
    // Buscar avaliações por período
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select(`
        id, overall_score, created_at,
        employee:employee_id (id, full_name, department_id)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('overall_score', 'is', null)

    // Agrupar por mês e departamento
    const monthlyData: Record<string, Record<string, number[]>> = {}
    
    evaluations?.forEach((evaluation: any) => {
      const date = new Date(evaluation.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const dept = evaluation.employee?.department_id || 'unknown'
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {}
      }
      if (!monthlyData[monthKey][dept]) {
        monthlyData[monthKey][dept] = []
      }
      
      monthlyData[monthKey][dept].push(evaluation.overall_score || 0)
    })

    // Buscar nomes dos departamentos
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')

    const deptNames = departments?.reduce((acc: any, dept: any) => {
      acc[dept.id] = dept.name
      return acc
    }, {} as Record<string, string>) || {}

    // Formatar dados para o gráfico
    const chartData = Object.keys(monthlyData).map(month => {
      const data: any = { month: formatMonth(month) }
      
      Object.keys(monthlyData[month]).forEach(deptId => {
        const scores = monthlyData[month][deptId]
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
        const deptName = deptNames[deptId] || deptId
        data[deptName.toLowerCase().replace(/\s+/g, '_')] = Math.round(avgScore * 10) / 10
      })
      
      return data
    })

    return NextResponse.json({
      performanceData: chartData,
      totalEvaluations: evaluations?.length || 0
    })
  } catch (error) {
    console.error('Erro ao buscar dados de performance:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados de performance' }, { status: 500 })
  }
}

async function getCHAData(supabase: any, startDate: Date, endDate: Date, departmentId?: string | null) {
  try {
    // Buscar avaliações do período e (opcional) por departamento
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select(`
        id, created_at,
        employee:employee_id (id, department_id)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const filteredEvalIds = (evaluations || [])
      .filter((ev: any) => !departmentId || ev.employee?.department_id === departmentId)
      .map((ev: any) => ev.id)

    if (filteredEvalIds.length === 0) {
      return NextResponse.json({ chaData: [], radarData: [], totalEvaluations: 0 })
    }

    // Buscar notas por competência (evaluation_skills) e categoria (skills)
    const { data: evalSkills } = await supabase
      .from('evaluation_skills')
      .select(`
        id, score, evaluation_id,
        skill:skill_id ( id, category )
      `)
      .in('evaluation_id', filteredEvalIds)

    // Agregar por categoria
    const group: Record<string, number[]> = { conhecimento: [], habilidade: [], atitude: [] }
    ;(evalSkills || []).forEach((row: any) => {
      const cat = row.skill?.category as 'conhecimento' | 'habilidade' | 'atitude' | undefined
      if (cat && typeof row.score === 'number') {
        group[cat] = group[cat] || []
        group[cat].push(row.score)
      }
    })

    const avg = (arr: number[]) => arr.length ? Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 10) / 10 : 0
    const chaData = [
      { skill: 'Conhecimento', atual: avg(group.conhecimento || []), meta: 90, anterior: 0 },
      { skill: 'Habilidade',   atual: avg(group.habilidade || []),   meta: 85, anterior: 0 },
      { skill: 'Atitude',      atual: avg(group.atitude || []),      meta: 88, anterior: 0 },
    ]

    // Radar: derivar das mesmas médias (placeholder real baseado nos dados)
    const radarData = [
      { subject: 'Conhecimento', A: chaData[0].atual, B: chaData[0].meta, fullMark: 100 },
      { subject: 'Habilidade',   A: chaData[1].atual, B: chaData[1].meta, fullMark: 100 },
      { subject: 'Atitude',      A: chaData[2].atual, B: chaData[2].meta, fullMark: 100 },
    ]

    return NextResponse.json({
      chaData,
      radarData,
      totalEvaluations: filteredEvalIds.length
    })
  } catch (error) {
    console.error('Erro ao buscar dados CHA:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados CHA' }, { status: 500 })
  }
}

async function getGoalsData(supabase: any, startDate: Date, endDate: Date, departmentId?: string | null) {
  try {
    // Buscar metas no período (tabela não possui categoria no schema)
    const { data: goals } = await supabase
      .from('goals')
      .select('id, is_completed, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const total = goals?.length || 0
    const completed = (goals || []).filter((g: any) => g.is_completed).length
    const open = total - completed

    const goalsProgress = [
      { category: 'Concluídas', total: completed, completed: completed },
      { category: 'Em aberto', total: open, completed: 0 },
    ]

    return NextResponse.json({ goalsProgress, totalGoals: total })
  } catch (error) {
    console.error('Erro ao buscar dados de metas:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados de metas' }, { status: 500 })
  }
}

async function getDepartmentsData(supabase: any, startDate: Date, endDate: Date, departmentId?: string | null) {
  try {
    // Buscar departamentos com funcionários
    const { data: departments } = await supabase
      .from('departments')
      .select(`
        id, name, description,
        employees:employees!department (id, full_name, is_active)
      `)

    // Buscar avaliações por departamento
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select(`
        id, overall_score, created_at,
        employee:employee_id (id, department_id)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calcular métricas por departamento
    const departmentMetrics = departments?.map((dept: any) => {
      const activeEmployees = dept.employees?.filter((emp: any) => emp.is_active) || []
      const deptEvaluations = evaluations?.filter((evaluation: any) => 
        evaluation.employee?.department_id === dept.id
      ) || []
      
      const avgScore = deptEvaluations.length > 0 
        ? deptEvaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.overall_score || 0), 0) / deptEvaluations.length
        : 0

      return {
        id: dept.id,
        name: dept.name,
        description: dept.description,
        employeeCount: activeEmployees.length,
        avgScore: Math.round(avgScore * 10) / 10,
        evaluationCount: deptEvaluations.length
      }
    }) || []

    return NextResponse.json({
      departments: departmentMetrics,
      totalDepartments: departments?.length || 0
    })
  } catch (error) {
    console.error('Erro ao buscar dados de departamentos:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados de departamentos' }, { status: 500 })
  }
}

async function getTrafficData(supabase: any, startDate: Date, endDate: Date) {
  try {
    // Tabela esperada: paid_traffic_daily (date, spent, meetings_scheduled, meetings_held, mother_contacts, first_op)
    const { data } = await supabase
      .from('paid_traffic_daily')
      .select('date, spent, meetings_scheduled, meetings_held, mother_contacts, first_op')
      .gte('date', startDate.toISOString().slice(0, 10))
      .lte('date', endDate.toISOString().slice(0, 10))
      .order('date', { ascending: true })

    const daily = (data || []).map((row: any) => ({
      date: row.date,
      spent: Number(row.spent || 0),
      meetingsScheduled: Number(row.meetings_scheduled || 0),
      meetingsHeld: Number(row.meetings_held || 0),
      motherContacts: Number(row.mother_contacts || 0),
      firstOp: Number(row.first_op || 0),
    }))

    const totals = daily.reduce((acc: any, d: any) => ({
      spent: acc.spent + d.spent,
      meetingsScheduled: acc.meetingsScheduled + d.meetingsScheduled,
      meetingsHeld: acc.meetingsHeld + d.meetingsHeld,
      motherContacts: acc.motherContacts + d.motherContacts,
      firstOp: acc.firstOp + d.firstOp,
    }), { spent: 0, meetingsScheduled: 0, meetingsHeld: 0, motherContacts: 0, firstOp: 0 })

    return NextResponse.json({ traffic: daily, trafficTotals: totals })
  } catch (error) {
    console.error('Erro ao buscar dados de tráfego pago:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados de tráfego pago' }, { status: 500 })
  }
}

function getDepartmentColor(departmentName: string): string {
  // Cores fixas e vibrantes para cada departamento
  const colorMap: Record<string, string> = {
    'Comercial Securitizadora': '#3b82f6', // Azul vibrante
    'Marketing': '#8b5cf6', // Roxo vibrante
    'Tecnologia': '#10b981', // Verde vibrante
    'Financeiro': '#ef4444', // Vermelho vibrante
    'Controladoria': '#f59e0b', // Laranja vibrante
    'Engenharia': '#06b6d4', // Ciano vibrante
    'Jurídico': '#84cc16', // Verde lima
    'Administrativo': '#f97316', // Laranja escuro
    'Limpeza': '#ec4899', // Rosa vibrante
    'Comercial Incorporadora': '#6366f1', // Índigo vibrante
    'Vendas': '#3b82f6',
    'TI': '#10b981',
    'RH': '#f59e0b',
    'Operações': '#06b6d4'
  }
  
  // Retornar cor específica ou cor padrão
  return colorMap[departmentName] || '#6b7280'
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return monthNames[parseInt(month) - 1] || month
}
