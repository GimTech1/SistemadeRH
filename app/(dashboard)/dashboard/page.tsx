'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  ClipboardCheck,
  BarChart3,
  Download,
  Filter,
  ChevronDown,
  Building,
  FileText,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
interface DashboardData {
  totalEmployees: number
  openRequests: number
  activeEvaluations: number
  completedGoals: number
  totalGoals: number
  averageScore: number
  recentEvaluations: any[]
  upcomingDeadlines: any[]
  performanceTrend: number
  departmentBreakdown: any[]
  monthlyData: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    totalEmployees: 0,
    openRequests: 0,
    activeEvaluations: 0,
    completedGoals: 0,
    totalGoals: 0,
    averageScore: 0,
    recentEvaluations: [],
    upcomingDeadlines: [],
    performanceTrend: 0,
    departmentBreakdown: [],
    monthlyData: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('all')
  

  function exportDeadlinesAsCSV() {
    const headers = ['Tarefa', 'Data', 'Tipo', 'Dias Restantes', 'Status']
    const rows = data.upcomingDeadlines.map((d: any) => [
      (d.title ?? '').toString().replaceAll(';', ','),
      (d.date ?? '').toString(),
      d.type === 'evaluation' ? 'Avaliação' : 'Meta',
      String(d.daysLeft ?? ''),
      (d.status ?? '').toString(),
    ])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proximos_prazos.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  async function copyDeadlinesToClipboard() {
    const lines = data.upcomingDeadlines.map((d: any) => `${d.title} • ${d.date} • ${d.type === 'evaluation' ? 'Avaliação' : 'Meta'} • ${d.daysLeft} dias • ${d.status}`)
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
    } catch {}
  }

  function exportPerformanceAsCSV() {
    const headers = ['Mês', 'Performance', 'Meta']
    const rows = data.monthlyData.map((m: any) => [m.month, String(m.value ?? ''), String(m.target ?? '')])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'breakdown_performance.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function exportDepartmentsAsCSV() {
    const headers = ['Departamento', 'Quantidade']
    const rows = data.departmentBreakdown.map((d: any) => [d.name, String(d.value ?? 0)])
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n')
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'departamentos.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Atualiza automaticamente quando a tabela public.goals mudar
  useEffect(() => {
    const channel = (supabase as any)
      .channel('rt-goals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        // Debounce simples para evitar múltiplos reloads em lote
        setTimeout(() => {
          loadDashboardData()
        }, 200)
      })
      .subscribe()
    return () => {
      try { (supabase as any).removeChannel(channel) } catch {}
    }
  }, [supabase])

  const loadDashboardData = async () => {
    try {
      const [employeesRes, requestsRes, activeEvalRes, completedGoalsRes, totalGoalsRes, scoresRes, deptRowsRes, deptsRes, goalsMetricsRes] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('requests').select('id', { count: 'exact', head: true }).in('status', ['requested', 'approved']),
        supabase.from('evaluations').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('goals').select('id', { count: 'exact', head: true }).eq('is_completed', true),
        supabase.from('goals').select('id', { count: 'exact', head: true }),
        supabase.from('evaluations').select('overall_score').not('overall_score', 'is', null),
        supabase
          .from('employees')
          .select('department')
          .eq('is_active', true)
          .not('department', 'is', null),
        supabase
          .from('departments')
          .select('id, name'),
        fetch('/api/goals/metrics', { cache: 'no-store' }).then(r => r.json()),
      ])

      const totalEmployees = employeesRes.count || 0
      const openRequests = requestsRes.count || 0
      const activeEvaluations = activeEvalRes.count || 0
      const completedGoals = completedGoalsRes.count || 0
      const totalGoals = totalGoalsRes.count || 0

      const scores = (scoresRes.data as { overall_score: number | null }[] | null) || []
      const validScores = scores.map(s => s.overall_score).filter((n): n is number => typeof n === 'number')
      const averageScore = validScores.length > 0
        ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1))
        : 0

      const fromBackend = goalsMetricsRes || { monthlyData: [], totalGoals: 0 }
      const monthlyData = (fromBackend.monthlyData || [])

      const palette = [
        { class: 'bg-yinmn-blue-500', hex: '#3B82F6' },
        { class: 'bg-silver-lake-blue-500', hex: '#06B6D4' },
        { class: 'bg-emerald-500', hex: '#10B981' },
        { class: 'bg-amber-500', hex: '#F59E0B' },
        { class: 'bg-purple-500', hex: '#8B5CF6' },
        { class: 'bg-rose-500', hex: '#F43F5E' },
        { class: 'bg-indigo-500', hex: '#6366F1' },
      ]

      const deptCountsMap = new Map<string, number>()
      ;((deptRowsRes.data as Array<{ department: string | null }> | null) || []).forEach(row => {
        const key = String(row.department)
        deptCountsMap.set(key, (deptCountsMap.get(key) || 0) + 1)
      })

      const idToName = new Map<string, string>(
        ((deptsRes.data as Array<{ id: string; name: string }> | null) || []).map(d => [d.id, d.name])
      )

      // Primeiro, criar um mapa com todos os departamentos (incluindo os sem funcionários)
      const allDepartments = Array.from(idToName.entries()).map(([id, name]) => ({
        id,
        name,
        count: deptCountsMap.get(id) || 0
      }))

      const departmentBreakdown = allDepartments
        .sort((a, b) => b.count - a.count)
        .map((dept, idx) => ({
          name: dept.name,
          value: dept.count,
          color: palette[idx % palette.length].class,
          hex: palette[idx % palette.length].hex,
        }))

      const { data: recentEvalsRaw } = await supabase
        .from('evaluations')
        .select('id, employee_id, overall_score, submitted_at, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      const employeeIds = Array.from(new Set(((recentEvalsRaw as Array<{ employee_id: string | null }> | null) || [])
        .map(r => r.employee_id)
        .filter((v): v is string => typeof v === 'string')))

      let employeesMap = new Map<string, { full_name: string; department: string | null }>()
      let deptMap = new Map<string, string>()
      if (employeeIds.length > 0) {
        const { data: employeesRows } = await supabase
          .from('employees')
          .select('id, full_name, department')
          .in('id', employeeIds)
        ;(employeesRows || []).forEach((e: any) => {
          employeesMap.set(e.id, { full_name: e.full_name, department: e.department })
        })
        const deptIds = Array.from(new Set((employeesRows || [])
          .map((e: any) => e.department)
          .filter((v: any): v is string => typeof v === 'string')))
        if (deptIds.length > 0) {
          const { data: deptRows } = await supabase
            .from('departments')
            .select('id, name')
            .in('id', deptIds)
          ;(deptRows || []).forEach((d: any) => deptMap.set(d.id, d.name))
        }
      }

      const recentEvaluations = ((recentEvalsRaw as Array<any> | null) || []).map(ev => {
        const emp = ev.employee_id ? employeesMap.get(ev.employee_id) : undefined
        const deptName = emp?.department ? (deptMap.get(emp.department) || emp.department) : ''
        const dateStr = new Date(ev.submitted_at || ev.created_at).toLocaleDateString('pt-BR')
        return {
          name: emp?.full_name || '—',
          department: deptName || '—',
          score: typeof ev.overall_score === 'number' ? ev.overall_score : null,
          date: dateStr,
          change: null as number | null,
        }
      })
      
      const today = new Date()
      const next60 = new Date()
      next60.setDate(today.getDate() + 60)

      const [{ data: cycles }, { data: goalsRows }] = await Promise.all([
        supabase
          .from('evaluation_cycles')
          .select('id, name, end_date, is_active')
          .gte('end_date', today.toISOString())
          .lte('end_date', next60.toISOString())
          .order('end_date', { ascending: true }),
        supabase
          .from('goals')
          .select('id, title, target_date, is_completed')
          .eq('is_completed', false)
          .not('target_date', 'is', null)
          .gte('target_date', today.toISOString())
          .lte('target_date', next60.toISOString())
          .order('target_date', { ascending: true }),
      ])

      const deadlines: Array<{ title: string; date: string; type: 'evaluation' | 'goal'; daysLeft: number; status: string }> = []
      ;(cycles || []).forEach((c: any) => {
        const dt = new Date(c.end_date)
        const diff = Math.ceil((dt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const status = diff <= 7 ? 'Urgente' : diff <= 30 ? 'Em andamento' : 'Planejado'
        deadlines.push({
          title: c.name || 'Ciclo de Avaliação',
          date: dt.toLocaleDateString('pt-BR'),
          type: 'evaluation',
          daysLeft: diff,
          status,
        })
      })
      ;(goalsRows || []).forEach((g: any) => {
        const dt = new Date(g.target_date)
        const diff = Math.ceil((dt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        const status = diff <= 7 ? 'Urgente' : diff <= 30 ? 'Em andamento' : 'Planejado'
        deadlines.push({
          title: g.title,
          date: dt.toLocaleDateString('pt-BR'),
          type: 'goal',
          daysLeft: diff,
          status,
        })
      })
      deadlines.sort((a, b) => a.daysLeft - b.daysLeft)

      setData(prev => ({
        ...prev,
        totalEmployees,
        openRequests,
        activeEvaluations,
        completedGoals,
        totalGoals: fromBackend.totalGoals || totalGoals,
        averageScore,
        recentEvaluations,
        upcomingDeadlines: deadlines,
        performanceTrend: prev.performanceTrend || 0,
        departmentBreakdown,
        monthlyData,
      }))
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Colaboradores',
      value: String(data.totalEmployees),
      subtitle: 'Total de funcionários',
      change: '',
      changeText: '',
      positive: true,
      color: 'border-l-[#415A77]',
      icon: Users,
      iconColor: 'text-[#778DA9]',
      iconBg: 'bg-[#E0E1DD]',
    },
    {
      title: 'Solicitações',
      value: String(data.openRequests),
      subtitle: 'Pedidos abertos',
      change: '',
      changeText: '',
      positive: true,
      color: 'border-l-[#415A77]',
      icon: FileText,
      iconColor: 'text-[#778DA9]',
      iconBg: 'bg-[#E0E1DD]',
    },
    {
      title: 'Avaliações',
      value: String(data.activeEvaluations),
      subtitle: 'Avaliações ativas',
      change: '',
      changeText: '',
      positive: true,
      color: 'border-l-[#415A77]',
      icon: ClipboardCheck,
      iconColor: 'text-[#778DA9]',
      iconBg: 'bg-[#E0E1DD]',
    },
    {
      title: 'Metas',
      value: String(data.totalGoals),
      subtitle: 'Total de metas',
      change: '',
      changeText: '',
      positive: true,
      color: 'border-l-[#415A77]',
      icon: Target,
      iconColor: 'text-[#778DA9]',
      iconBg: 'bg-[#E0E1DD]',
    },
    {
      title: 'Performance',
      value: String(data.averageScore || 0),
      subtitle: 'Média geral',
      change: '',
      changeText: '',
      positive: true,
      color: 'border-l-[#415A77]',
      icon: Award,
      iconColor: 'text-[#778DA9]',
      iconBg: 'bg-[#E0E1DD]',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-tight">Visão geral de desempenho e métricas</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statsCards.map((stat, index) => (
          <div key={index} className={`bg-white rounded-lg border-l-4 ${stat.color} p-5 shadow-sm hover:shadow-md transition-shadow duration-300`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-roboto font-bold text-rich-black-900">{stat.value}</p>
                    <p className="text-sm font-roboto font-medium text-rich-black-900">{stat.title}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-roboto font-light text-oxford-blue-500">{stat.subtitle}</p>
                  {(stat.change && stat.changeText) ? (
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-roboto font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs font-roboto font-light text-oxford-blue-400">{stat.changeText}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Breakdown de Performance */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-platinum-200 h-full flex flex-col">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Breakdown de Performance</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-500 mt-1">Comparado ao período anterior</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-platinum-50 rounded-lg transition-colors"
                  onClick={exportPerformanceAsCSV}
                >
                  <Download className="w-4 h-4 text-oxford-blue-400" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 min-h-[520px] flex-1">
            <div className="mb-4 flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Mês:</label>
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-3 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                {data.monthlyData.map((m: any) => (
                  <option key={m.key} value={m.key}>{m.month}</option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              {(() => {
                const list = selectedMonthKey === 'all' 
                  ? (data.monthlyData as any[])
                  : (data.monthlyData as any[]).filter(d => d.key === selectedMonthKey)
                if (!list || list.length === 0) return null
                const totalSum = list.reduce((acc, it: any) => acc + (Number(it.total) || 0), 0)
                const completedSum = list.reduce((acc, it: any) => acc + (Number(it.completed) || 0), 0)
                const pct = totalSum > 0 ? Math.round((completedSum / totalSum) * 100) : 0
                return (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-roboto font-medium text-oxford-blue-500">Metas Totais</span>
                      <span className="text-xl font-roboto font-medium text-oxford-blue-600">{totalSum}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-roboto font-medium text-emerald-600">Atingimento</span>
                      <span className="text-xl font-roboto font-semibold text-emerald-600">{`${pct}%`}</span>
                    </div>
                  </>
                )
              })()}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-roboto font-medium text-oxford-blue-400 uppercase tracking-wider">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>
              <div className="space-y-4">
                {(selectedMonthKey === 'all' ? data.monthlyData : data.monthlyData.filter((d: any) => d.key === selectedMonthKey)).map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-8 text-xs font-roboto font-medium text-oxford-blue-600">{item.month}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-platinum-100 rounded-full h-8 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yinmn-blue-400 to-yinmn-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.value}%` }}
                        ></div>
                        <div 
                          className="absolute top-0 bg-gradient-to-r from-platinum-300 to-platinum-400 h-full w-1 transition-all duration-500"
                          style={{ left: `${item.target}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-roboto font-medium text-rich-black-900 w-8">{item.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-platinum-200">
            <button className="text-yinmn-blue-600 hover:text-yinmn-blue-700 font-roboto font-medium text-sm flex items-center gap-2 transition-colors">
              ABRIR RELATÓRIO
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Segmentos */}
        <div className="bg-white rounded-lg shadow-sm border border-platinum-200 h-full flex flex-col">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Departamentos</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-500 mt-1">Distribuição por área</p>
              </div>
              <button
                className="p-2 hover:bg-platinum-50 rounded-lg transition-colors"
                onClick={exportDepartmentsAsCSV}
                aria-label="Exportar departamentos"
                title="Exportar CSV"
              >
                <Download className="w-4 h-4 text-oxford-blue-400" />
              </button>
            </div>
          </div>
          <div className="p-6 flex-1">
            <div className="relative w-48 h-48 mx-auto mb-6">
              {(() => {
                const total = data.departmentBreakdown.reduce((sum: number, d: any) => sum + (d.value || 0), 0)
                if (total === 0) return null
                let start = 0
                const stops: string[] = []
                data.departmentBreakdown.forEach((d: any) => {
                  const pct = ((d.value || 0) / total) * 100
                  const end = start + pct
                  const color = d.hex || '#3B82F6'
                  stops.push(`${color} ${start.toFixed(2)}% ${end.toFixed(2)}%`)
                  start = end
                })
                const bg = `conic-gradient(${stops.join(', ')})`
                return (
                  <div className="w-full h-full rounded-full relative overflow-hidden" style={{ background: bg }}>
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-roboto font-semibold text-rich-black-900">{data.totalEmployees}</div>
                        <div className="text-xs font-roboto font-medium text-oxford-blue-500">Total</div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
            
            <div className="space-y-3">
              {(() => {
                const total = data.departmentBreakdown.reduce((sum: number, d: any) => sum + (d.value || 0), 0)
                return data.departmentBreakdown.map((dept: any, index: number) => {
                  const pct = total > 0 ? Math.round(((dept.value || 0) / total) * 100) : 0
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                        <span className="text-sm font-roboto font-medium text-rich-black-900">{dept.name}</span>
                      </div>
                      <span className="text-sm font-roboto font-medium text-oxford-blue-600">{`${dept.value} (${pct}%)`}</span>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
          <div className="p-6 border-t border-platinum-200">
            <button className="text-yinmn-blue-600 hover:text-yinmn-blue-700 font-roboto font-medium text-sm flex items-center gap-2 transition-colors">
              ABRIR RELATÓRIO
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Avaliações Recentes</h3>
              <Link href="/evaluations" className="text-sm font-roboto font-medium text-yinmn-blue-600 hover:text-yinmn-blue-700">
                Ver todas
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-roboto font-light text-oxford-blue-500 uppercase tracking-wider">
                    <th className="pb-4 font-light">Colaborador</th>
                    <th className="pb-4 font-light">Departamento</th>
                    <th className="pb-4 font-light">Data</th>
                    <th className="pb-4 text-right font-light">Nota</th>
                    <th className="pb-4 text-right font-light">Variação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-platinum-100">
                  {data.recentEvaluations.map((evaluation: any, index: number) => (
                    <tr key={index} className="text-sm hover:bg-platinum-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yinmn-blue-100 to-yinmn-blue-200/50 flex items-center justify-center text-sm font-roboto font-medium text-yinmn-blue-700">
                            {evaluation.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="font-roboto font-medium text-rich-black-900">{evaluation.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-oxford-blue-600 font-roboto font-light">{evaluation.department || '—'}</td>
                      <td className="py-4 text-oxford-blue-600 font-roboto font-light">{evaluation.date}</td>
                      <td className="py-4 text-right">
                        {typeof evaluation.score === 'number' ? (
                          <span className="font-roboto font-semibold text-rich-black-900">{evaluation.score}</span>
                        ) : (
                          <span className="text-oxford-blue-400">—</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {typeof evaluation.change === 'number' ? (
                          <span className={`inline-flex items-center text-xs font-roboto font-medium px-3 py-1 rounded-full ${
                            evaluation.change >= 0 
                              ? 'text-emerald-700 bg-emerald-50/80 border border-emerald-200/50' 
                              : 'text-red-700 bg-red-50/80 border border-red-200/50'
                          }`}>
                            {evaluation.change > 0 ? `+${evaluation.change.toFixed(1)}` : evaluation.change.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-oxford-blue-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Próximos Prazos</h3>
              <button
                className="p-1 hover:bg-platinum-50 rounded-lg transition-colors"
                onClick={exportDeadlinesAsCSV}
                aria-label="Exportar prazos"
                title="Exportar CSV"
              >
                <Download className="w-4 h-4 text-oxford-blue-400" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-roboto font-light text-oxford-blue-500 uppercase tracking-wider">
                    <th className="pb-4 font-light">Tarefa</th>
                    <th className="pb-4 font-light">Data</th>
                    <th className="pb-4 font-light">Tipo</th>
                    <th className="pb-4 font-light">Dias Restantes</th>
                    <th className="pb-4 text-right font-light">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-platinum-100">
                  {data.upcomingDeadlines.map((deadline: any, index: number) => (
                    <tr key={index} className="text-sm hover:bg-platinum-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                          </div>
                          <span className="font-roboto font-medium text-rich-black-900">{deadline.title}</span>
                        </div>
                      </td>
                      <td className="py-4 text-oxford-blue-600 font-roboto font-light">{deadline.date}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-roboto font-medium ${
                          deadline.type === 'evaluation' ? 'bg-yinmn-blue-50 text-yinmn-blue-700 border border-yinmn-blue-200/50' :
                          deadline.type === 'goal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                          'bg-purple-50 text-purple-700 border border-purple-200/50'
                        }`}>
                          {deadline.type === 'evaluation' ? 'Avaliação' : 'Meta'}
                        </span>
                      </td>
                      <td className="py-4 text-oxford-blue-600 font-roboto font-light">{deadline.daysLeft} dias</td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex items-center text-xs font-roboto font-medium px-3 py-1 rounded-full ${
                          deadline.status === 'Urgente' 
                            ? 'text-red-700 bg-red-50/80 border border-red-200/50' 
                            : deadline.status === 'Em andamento'
                            ? 'text-amber-700 bg-amber-50/80 border border-amber-200/50'
                            : 'text-emerald-700 bg-emerald-50/80 border border-emerald-200/50'
                        }`}>
                          {deadline.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {data.upcomingDeadlines.map((deadline: any, index: number) => (
                <div key={index} className="bg-platinum-50/30 rounded-lg p-4 border border-platinum-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-roboto font-medium text-rich-black-900 text-sm leading-tight">{deadline.title}</h4>
                        <p className="text-xs font-roboto font-light text-oxford-blue-500 mt-1">{deadline.date}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center text-xs font-roboto font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                      deadline.status === 'Urgente' 
                        ? 'text-red-700 bg-red-50/80 border border-red-200/50' 
                        : deadline.status === 'Em andamento'
                        ? 'text-amber-700 bg-amber-50/80 border border-amber-200/50'
                        : 'text-emerald-700 bg-emerald-50/80 border border-emerald-200/50'
                    }`}>
                      {deadline.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-roboto font-medium ${
                        deadline.type === 'evaluation' ? 'bg-yinmn-blue-50 text-yinmn-blue-700 border border-yinmn-blue-200/50' :
                        deadline.type === 'goal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                        'bg-purple-50 text-purple-700 border border-purple-200/50'
                      }`}>
                        {deadline.type === 'evaluation' ? 'Avaliação' : 'Meta'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-roboto font-medium text-oxford-blue-600">{deadline.daysLeft} dias</span>
                      <p className="text-xs font-roboto font-light text-oxford-blue-500">restantes</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/requests" className="bg-white rounded-lg p-6 shadow-sm border border-platinum-200 hover:shadow-md transition-shadow duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-lg flex items-center justify-center group-hover:bg-[#d6d8d4] transition-colors">
              <FileText className="w-6 h-6 text-[#778DA9]" />
            </div>
            <div>
              <h4 className="font-roboto font-medium text-rich-black-900">Solicitações</h4>
              <p className="text-sm font-roboto font-light text-oxford-blue-500">Criar e acompanhar pedidos</p>
            </div>
          </div>
        </Link>
        <Link href="/evaluations/new" className="bg-white rounded-lg p-6 shadow-sm border border-platinum-200 hover:shadow-md transition-shadow duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yinmn-blue-100 rounded-lg flex items-center justify-center group-hover:bg-yinmn-blue-200 transition-colors">
              <ClipboardCheck className="w-6 h-6 text-yinmn-blue-600" />
            </div>
            <div>
              <h4 className="font-roboto font-medium text-rich-black-900">Nova Avaliação</h4>
              <p className="text-sm font-roboto font-light text-oxford-blue-500">Criar avaliação de desempenho</p>
            </div>
          </div>
        </Link>
        <Link href="/goals" className="bg-white rounded-lg p-6 shadow-sm border border-platinum-200 hover:shadow-md transition-shadow duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-roboto font-medium text-rich-black-900">Gerenciar Metas</h4>
              <p className="text-sm font-roboto font-light text-oxford-blue-500">Definir e acompanhar objetivos</p>
            </div>
          </div>
        </Link>
        <Link href="/reports" className="bg-white rounded-lg p-6 shadow-sm border border-platinum-200 hover:shadow-md transition-shadow duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-roboto font-medium text-rich-black-900">Relatórios</h4>
              <p className="text-sm font-roboto font-light text-oxford-blue-500">Gerar análises detalhadas</p>
        </div>
          </div>
        </Link>
      </div>
    </div>
  )
}