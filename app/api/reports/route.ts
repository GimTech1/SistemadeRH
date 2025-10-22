import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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
        return await getOverviewData(supabase, startDate, endDate, departmentId)
      case 'performance':
        return await getPerformanceData(supabase, startDate, endDate, departmentId)
      case 'cha':
        return await getCHAData(supabase, startDate, endDate, departmentId)
      case 'goals':
        return await getGoalsData(supabase, startDate, endDate, departmentId)
      case 'departments':
        return await getDepartmentsData(supabase, startDate, endDate, departmentId)
      default:
        return await getOverviewData(supabase, startDate, endDate, departmentId)
    }
  } catch (error) {
    console.error('Erro na API de relatórios:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

async function getOverviewData(supabase: any, startDate: Date, endDate: Date, departmentId?: string | null) {
  try {
    // Buscar departamentos
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name')
      .order('name')

    // Buscar funcionários por departamento
    const { data: employees } = await supabase
      .from('employees')
      .select('id, full_name, department, is_active')
      .eq('is_active', true)

    // Buscar avaliações recentes
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select(`
        id, overall_score, knowledge_score, skill_score, attitude_score, created_at,
        employee:employee_id (id, full_name, department)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('overall_score', 'is', null)

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
        evaluation.employee?.department === dept.id
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

    // Top performers
    const topPerformers = evaluations
      ?.filter((evaluation: any) => evaluation.overall_score && evaluation.employee)
      .sort((a: any, b: any) => (b.overall_score || 0) - (a.overall_score || 0))
      .slice(0, 5)
      .map((evaluation: any) => ({
        name: evaluation.employee?.full_name || 'N/A',
        score: evaluation.overall_score,
        department: evaluation.employee?.department || 'N/A'
      })) || []

    return NextResponse.json({
      departmentDistribution,
      performanceData,
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
        id, overall_score, knowledge_score, skill_score, attitude_score, created_at,
        employee:employee_id (id, full_name, department)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('overall_score', 'is', null)

    // Agrupar por mês e departamento
    const monthlyData: Record<string, Record<string, number[]>> = {}
    
    evaluations?.forEach((evaluation: any) => {
      const date = new Date(evaluation.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const dept = evaluation.employee?.department || 'unknown'
      
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
    // Buscar avaliações com scores CHA
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select(`
        id, knowledge_score, skill_score, attitude_score, created_at,
        employee:employee_id (id, full_name, department)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .not('knowledge_score', 'is', null)
      .not('skill_score', 'is', null)
      .not('attitude_score', 'is', null)

    // Calcular médias CHA
    const chaData = [
      {
        skill: 'Conhecimento',
        atual: evaluations?.length > 0 
          ? Math.round(evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.knowledge_score || 0), 0) / evaluations.length * 10) / 10
          : 0,
        meta: 90,
        anterior: 80 // TODO: Implementar comparação com período anterior
      },
      {
        skill: 'Habilidade',
        atual: evaluations?.length > 0 
          ? Math.round(evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.skill_score || 0), 0) / evaluations.length * 10) / 10
          : 0,
        meta: 85,
        anterior: 82
      },
      {
        skill: 'Atitude',
        atual: evaluations?.length > 0 
          ? Math.round(evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.attitude_score || 0), 0) / evaluations.length * 10) / 10
          : 0,
        meta: 88,
        anterior: 85
      }
    ]

    // Dados do radar (competências)
    const radarData = [
      { subject: 'Liderança', A: 85, B: 90, fullMark: 100 },
      { subject: 'Comunicação', A: 88, B: 85, fullMark: 100 },
      { subject: 'Técnica', A: 92, B: 88, fullMark: 100 },
      { subject: 'Trabalho em Equipe', A: 87, B: 92, fullMark: 100 },
      { subject: 'Inovação', A: 83, B: 87, fullMark: 100 },
      { subject: 'Resultados', A: 90, B: 89, fullMark: 100 }
    ]

    return NextResponse.json({
      chaData,
      radarData,
      totalEvaluations: evaluations?.length || 0
    })
  } catch (error) {
    console.error('Erro ao buscar dados CHA:', error)
    return NextResponse.json({ error: 'Erro ao buscar dados CHA' }, { status: 500 })
  }
}

async function getGoalsData(supabase: any, startDate: Date, endDate: Date, departmentId?: string | null) {
  try {
    // Buscar metas
    const { data: goals } = await supabase
      .from('goals')
      .select('id, title, category, is_completed, target_date, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Agrupar por categoria
    const goalsByCategory: Record<string, { total: number; completed: number }> = {}
    
    goals?.forEach((goal: any) => {
      const category = goal.category || 'Outros'
      if (!goalsByCategory[category]) {
        goalsByCategory[category] = { total: 0, completed: 0 }
      }
      goalsByCategory[category].total++
      if (goal.is_completed) {
        goalsByCategory[category].completed++
      }
    })

    const goalsProgress = Object.keys(goalsByCategory).map(category => ({
      category,
      total: goalsByCategory[category].total,
      completed: goalsByCategory[category].completed
    }))

    return NextResponse.json({
      goalsProgress,
      totalGoals: goals?.length || 0
    })
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
        employee:employee_id (id, department)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Calcular métricas por departamento
    const departmentMetrics = departments?.map((dept: any) => {
      const activeEmployees = dept.employees?.filter((emp: any) => emp.is_active) || []
      const deptEvaluations = evaluations?.filter((evaluation: any) => 
        evaluation.employee?.department === dept.id
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
