'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  Users,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
    AreaChart,
    ReferenceLine,
} from 'recharts'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'

interface ReportData {
  departmentDistribution?: Array<{ name: string; value: number; fill: string }>
  performanceData?: Array<{ [key: string]: any }>
  topPerformers?: Array<{ name: string; score: number; department: string }>
  chaData?: Array<{ skill: string; atual: number; meta: number; anterior: number }>
  radarData?: Array<{ subject: string; A: number; B: number; fullMark: number }>
  goalsProgress?: Array<{ category: string; total: number; completed: number }>
  totalEmployees?: number
  totalEvaluations?: number
  totalGoals?: number
  departments?: Array<{ id: string; name: string; employeeCount: number; avgScore: number }>
}

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedReport, setSelectedReport] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({})
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])
  const supabase = createClient()
  const overviewTrendRef = useRef<HTMLDivElement | null>(null)
  const currentViewRef = useRef<HTMLDivElement | null>(null)
  const [hoverY, setHoverY] = useState<number | null>(null)
  const [showAllTopPerformers, setShowAllTopPerformers] = useState(false)

  // Carregar departamentos na inicialização
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await fetch('/api/departments')
        const data = await response.json()
        if (data.departments) {
          setDepartments(data.departments)
        }
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error)
      }
    }
    loadDepartments()
  }, [])

  // Carregar dados do relatório quando os filtros mudarem
  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          period: selectedPeriod,
          type: selectedReport,
          ...(selectedDepartment !== 'all' && { department_id: selectedDepartment })
        })
        if (selectedReport === 'overview' && showAllTopPerformers) {
          params.set('limit', 'all')
        }
        
        const response = await fetch(`/api/reports?${params}`)
        const data = await response.json()
        
        if (response.ok) {
          setReportData(data)
        } else {
          toast.error('Erro ao carregar dados do relatório')
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast.error('Erro ao carregar dados do relatório')
      } finally {
        setLoading(false)
      }
    }
    
    loadReportData()
  }, [selectedPeriod, selectedDepartment, selectedReport, showAllTopPerformers])

  // Usar somente dados reais vindos da API (sem mocks)
  // Para a visão Overview, usar EXCLUSIVAMENTE a série temporal enviada pela API (performanceTrend)
  const performanceTrend = (reportData as any).performanceTrend as Array<any> | undefined
  const trendData = Array.isArray(performanceTrend) ? performanceTrend : []
  // performanceData é utilizado nas demais visões (não-temporais)
  const performanceData = reportData.performanceData || []
  const chaData = reportData.chaData || []
  const departmentDistribution = reportData.departmentDistribution || []
  const radarData = reportData.radarData || []
  const goalsProgress = reportData.goalsProgress || []
  const topPerformers = reportData.topPerformers || []

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      setLoading(true)
      if (format === 'pdf') {
        const { default: html2canvas } = await import('html2canvas')
        const { default: jsPDF } = await import('jspdf')
        const target = currentViewRef.current || overviewTrendRef.current
        if (!target) {
          toast.error('Nada para exportar')
          setLoading(false)
          return
        }
        const canvas = await html2canvas(target, { scale: 2, backgroundColor: '#ffffff' })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
        const imgWidth = canvas.width * ratio
        const imgHeight = canvas.height * ratio
        const x = (pageWidth - imgWidth) / 2
        const y = (pageHeight - imgHeight) / 2
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
        pdf.save(`relatorio-${selectedReport}-${selectedPeriod}.pdf`)
        toast.success('PDF gerado com sucesso')
      } else {
        // Exportar CSV simples (compatível com Excel)
        const rows: Array<Record<string, any>> = []
        if (selectedReport === 'overview') {
          if (Array.isArray(performanceTrend)) rows.push(...performanceTrend)
        } else if (selectedReport === 'performance' && Array.isArray(reportData.performanceData)) {
          rows.push(...reportData.performanceData)
        } else if (selectedReport === 'cha' && Array.isArray(reportData.chaData)) {
          rows.push(...reportData.chaData)
        } else if (selectedReport === 'goals' && Array.isArray(reportData.goalsProgress)) {
          rows.push(...reportData.goalsProgress)
        } else if (selectedReport === 'departments' && Array.isArray((reportData as any).departments)) {
          rows.push(...((reportData as any).departments))
        }
        if (rows.length === 0) {
          toast.error('Sem dados para exportar')
          setLoading(false)
          return
        }
        const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))))
        const csv = [headers.join(','), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio-${selectedReport}-${selectedPeriod}.csv`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('CSV exportado (abra no Excel)')
      }
    } catch (e) {
      console.error(e)
      toast.error('Falha ao exportar')
    } finally {
      setLoading(false)
    }
  }

  const reportTypes = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'performance', name: 'Performance', icon: TrendingUp },
    { id: 'cha', name: 'Análise CHA', icon: Award },
    { id: 'goals', name: 'Metas', icon: Target },
    { id: 'departments', name: 'Departamentos', icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-rich-black-900">Visualize métricas e gere relatórios detalhados - PAGINA EM DESENVOLVIMENTO</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleExport('pdf')}
            variant="secondary"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button 
            onClick={() => handleExport('excel')}
            variant="primary"
            size="sm"
            disabled={loading}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <Button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              variant={selectedReport === type.id ? 'primary' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {type.name}
            </Button>
          )
        })}
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <style jsx>{`
            .custom-select {
              background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
              background-position: right 0.5rem center;
              background-repeat: no-repeat;
              background-size: 1.5em 1.5em;
            }
          `}</style>
           <select
             value={selectedPeriod}
             onChange={(e) => setSelectedPeriod(e.target.value)}
             className="custom-select px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:ring-2 focus:ring-yinmn-blue-500 focus:border-yinmn-blue-500 appearance-none pr-8 min-w-[180px]"
           >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
           <select
             value={selectedDepartment}
             onChange={(e) => setSelectedDepartment(e.target.value)}
             className="custom-select px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:ring-2 focus:ring-yinmn-blue-500 focus:border-yinmn-blue-500 appearance-none pr-8 min-w-[220px]"
             disabled={loading}
           >
            <option value="all">Todos os Departamentos</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yinmn-blue-500"></div>
          <span className="ml-2 text-rich-black-900">Carregando dados...</span>
        </div>
      )}

      {selectedReport === 'overview' && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={currentViewRef}>
          <div className="card p-6" ref={overviewTrendRef}>
            <style jsx>{`
              /* Esconde marcadores ativos (bolinhas) no hover do LineChart */
              :global(.recharts-active-dot) { display: none; }
            `}</style>
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Tendência de Performance</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart 
                  data={trendData}
                  onMouseMove={(state: any) => {
                    try {
                      const payload = state?.activePayload || []
                      const first = payload.find((p: any) => typeof p?.value === 'number')
                      if (first && typeof first.value === 'number') {
                        setHoverY(first.value)
                      }
                    } catch {}
                  }}
                  onMouseLeave={() => setHoverY(null)}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    cursor={false}
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Legend iconType="plainline" />
                  {hoverY !== null && (
                    <ReferenceLine y={hoverY} stroke="#3b82f6" strokeDasharray="0" strokeWidth={2} ifOverflow="extendDomain" />
                  )}
                  {(() => {
                    const keys = Object.keys(trendData[0] || {}).filter(k => k !== 'month')
                    const palette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']
                    return keys.map((key, idx) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={palette[idx % palette.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                        connectNulls
                      />
                    ))
                  })()}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-oxford-blue-600">
                Nenhum dado de performance disponível
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Distribuição por Departamento</h3>
            {departmentDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <RePieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={40}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {departmentDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fill || '#6b7280'}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '14px'
                    }}
                    itemStyle={{ color: '#1f2937', fontWeight: '500' }}
                    formatter={(value: any, name: any) => [
                      `${value} funcionários`, 
                      name
                    ]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={60}
                    formatter={(value: any, entry: any) => {
                      const data = departmentDistribution.find(d => d.name === value)
                      return (
                        <span style={{ 
                          color: '#374151', 
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {value}: {data?.value || 0} funcionários
                        </span>
                      )
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-oxford-blue-600">
                Nenhum dado de departamento disponível
              </div>
            )}
          </div>

          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-rich-black-900">Top Performers</h3>
              {topPerformers.length > 0 && (
                <button
                  className="text-sm text-yinmn-blue-600 hover:underline disabled:opacity-50"
                  onClick={() => setShowAllTopPerformers(prev => !prev)}
                  disabled={loading}
                >
                  {showAllTopPerformers ? 'Ver menos' : 'Ver todos'}
                </button>
              )}
            </div>
            {topPerformers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-xs font-medium text-oxford-blue-600 uppercase tracking-wider">
                    <tr className="border-b border-neutral-800">
                      <th className="pb-3">Posição</th>
                      <th className="pb-3">Nome</th>
                      <th className="pb-3">Departamento</th>
                      <th className="pb-3">Pontuação</th>
                      <th className="pb-3">Tendência</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {topPerformers.map((performer, index) => (
                      <tr key={index} className="text-sm">
                        <td className="py-3 text-oxford-blue-600">#{index + 1}</td>
                        <td className="py-3 text-rich-black-900 font-medium">{performer.name}</td>
                        <td className="py-3 text-oxford-blue-600">{performer.department}</td>
                        <td className="py-3">
                          <span className="text-yellow-500 font-semibold">{performer.score}</span>
                        </td>
                        <td className="py-3">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-oxford-blue-600">
                Nenhum dado de top performers disponível
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'performance' && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Performance por Departamento</h3>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Legend iconType="plainline" />
                  {(() => {
                    const keys = Object.keys(performanceData[0] || {}).filter(k => k !== 'month')
                    const palette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16', '#f97316']
                    return keys.map((key, idx) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={palette[idx % palette.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}
                        connectNulls
                      />
                    ))
                  })()}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[450px] text-oxford-blue-600">
                Nenhum dado de performance disponível
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'cha' && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Análise CHA</h3>
            {chaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="skill" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Legend iconType="plainline" />
                  <Line type="monotone" dataKey="anterior" stroke="#6b7280" strokeWidth={2} dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="atual" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={false} />
                  <Line type="monotone" dataKey="meta" stroke="#10b981" strokeWidth={2} dot={false} activeDot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-oxford-blue-600">
                Nenhum dado CHA disponível
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Competências</h3>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                  <PolarRadiusAxis stroke="#374151" />
                  <Radar name="Atual" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name="Meta" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-oxford-blue-600">
                Nenhum dado de competências disponível
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'goals' && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Progresso de Metas</h3>
            {goalsProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={goalsProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#10b981" />
                  <Bar dataKey="total" stackId="a" fill="#6b7280" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-oxford-blue-600">
                Nenhum dado de metas disponível
              </div>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'departments' && !loading && (
        <div className="grid grid-cols-1 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Análise Comparativa</h3>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Legend />
                  <Bar dataKey="vendas" fill="#3b82f6" />
                  <Bar dataKey="marketing" fill="#8b5cf6" />
                  <Bar dataKey="ti" fill="#10b981" />
                  <Bar dataKey="rh" fill="#f59e0b" />
                  <Bar dataKey="financeiro" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[450px] text-oxford-blue-600">
                Nenhum dado de departamentos disponível
              </div>
            )}
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Métricas por Departamento</h3>
            {Array.isArray((reportData as any).departments) && (reportData as any).departments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-xs font-medium text-oxford-blue-600 uppercase tracking-wider">
                    <tr className="border-b border-neutral-800">
                      <th className="pb-3">Departamento</th>
                      <th className="pb-3">Colaboradores Ativos</th>
                      <th className="pb-3">Média de Score</th>
                      <th className="pb-3">Total de Avaliações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {((reportData as any).departments as Array<any>).map((dept, idx) => (
                      <tr key={dept.id || idx} className="text-sm">
                        <td className="py-3 text-rich-black-900 font-medium">{dept.name}</td>
                        <td className="py-3 text-oxford-blue-600">{dept.employeeCount}</td>
                        <td className="py-3"><span className="text-yellow-500 font-semibold">{dept.avgScore}</span></td>
                        <td className="py-3 text-oxford-blue-600">{dept.evaluationCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-oxford-blue-600">
                Nenhuma métrica encontrada
              </div>
            )}
          </div>
        </div>
      )}
      <div className="h-10" />
    </div>
  )
}
