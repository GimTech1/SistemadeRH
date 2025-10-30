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
  const [trafficStart, setTrafficStart] = useState<string>(() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0,10) })
  const [trafficEnd, setTrafficEnd] = useState<string>(() => new Date().toISOString().slice(0,10))
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({})
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([])
  const supabase = createClient()
  const reportContainerRef = useRef<HTMLDivElement | null>(null)
  const overviewTrendRef = useRef<HTMLDivElement | null>(null)
  const distributionRef = useRef<HTMLDivElement | null>(null)
  const topRef = useRef<HTMLDivElement | null>(null)
  const insightsRef = useRef<HTMLDivElement | null>(null)
  const trafficCardsRef = useRef<HTMLDivElement | null>(null)
  const trafficChartRef = useRef<HTMLDivElement | null>(null)
  const trafficTableRef = useRef<HTMLDivElement | null>(null)
  const [hoverY, setHoverY] = useState<number | null>(null)
  const [showAllTopPerformers, setShowAllTopPerformers] = useState(false)
  const [insights, setInsights] = useState<any | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showTrafficModal, setShowTrafficModal] = useState(false)
  const [trafficForm, setTrafficForm] = useState({
    date: new Date().toISOString().slice(0,10),
    spent: '', meetingsScheduled: '', meetingsHeld: '', motherContacts: '', firstOp: ''
  })

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
        if (selectedReport === 'traffic') {
          params.set('start', trafficStart)
          params.set('end', trafficEnd)
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
  }, [selectedPeriod, selectedDepartment, selectedReport, showAllTopPerformers, trafficStart, trafficEnd])

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
  const traffic = (reportData as any).traffic || []
  const trafficTotals = (reportData as any).trafficTotals || { spent: 0, meetingsScheduled: 0, meetingsHeld: 0, motherContacts: 0, firstOp: 0 }

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      if (format === 'pdf') setExporting(true)
      if (format === 'pdf') {
        const { default: html2canvas } = await import('html2canvas')
        const { default: jsPDF } = await import('jspdf')
        let sections = (
          selectedReport === 'traffic'
            ? [trafficCardsRef.current, trafficChartRef.current, trafficTableRef.current]
            : [overviewTrendRef.current, distributionRef.current, topRef.current, insightsRef.current]
        ).filter(Boolean) as HTMLDivElement[]
        if (sections.length === 0 && reportContainerRef.current) {
          sections = [reportContainerRef.current]
        }
        if (sections.length === 0) {
          toast.error('Nada para exportar')
          setLoading(false)
          return
        }

        const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        // Layout elegante com a cor solicitada
        const marginX = 40
        const headerHeight = 72
        const footerHeight = 48
        const primary = '#1b263b'
        const accent = '#111827'
        const subtle = 210

        const generatedAt = new Date().toLocaleString()
        const periodMap: Record<string, string> = { week: 'Última Semana', month: 'Último Mês', quarter: 'Último Trimestre', year: 'Último Ano' }
        const periodLabel = selectedReport === 'traffic'
          ? `${new Date(trafficStart).toLocaleDateString('pt-BR')} a ${new Date(trafficEnd).toLocaleDateString('pt-BR')}`
          : (periodMap[selectedPeriod] || selectedPeriod)
        const deptLabel = selectedReport === 'traffic'
          ? 'Tráfego Pago'
          : (selectedDepartment === 'all' ? 'Todos os Departamentos' : (departments.find(d => d.id === selectedDepartment)?.name || selectedDepartment))
        const reportTitle = selectedReport === 'traffic' ? 'Relatório - Tráfego Pago' : 'Relatório - Visão Geral'

        // Tentar carregar logo (com dimensões naturais para manter proporção)
        type LoadedLogo = { dataUrl: string; w: number; h: number }
        const loadLogo = async (): Promise<LoadedLogo | null> => {
          const candidates = ['/logo-full-horizontal-branco.png']
          for (const path of candidates) {
            try {
              const res = await fetch(path)
              if (!res.ok) continue
              const blob = await res.blob()
              const reader = new FileReader()
              const dataUrl: string = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
              })
              const img = new Image()
              const dims = await new Promise<{ w: number; h: number }>((resolve) => {
                img.onload = () => resolve({ w: img.width, h: img.height })
                img.src = dataUrl
              })
              return { dataUrl, w: dims.w, h: dims.h }
            } catch {}
          }
          return null
        }
        const logoLoaded = await loadLogo()

        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i]
          const canvas = await html2canvas(sec, { scale: 2, backgroundColor: '#ffffff' })
          const imgData = canvas.toDataURL('image/png')
          const availWidth = pageWidth - marginX * 2
          const availHeight = pageHeight - headerHeight - footerHeight
          const ratio = Math.min(availWidth / canvas.width, availHeight / canvas.height)
          const imgWidth = canvas.width * ratio
          const imgHeight = canvas.height * ratio
          const x = marginX + (availWidth - imgWidth) / 2
          const y = headerHeight + (availHeight - imgHeight) / 2
          if (i > 0) pdf.addPage()
          // Header elegante
          pdf.setFillColor(primary)
          pdf.rect(0, 0, pageWidth, headerHeight, 'F')
          // logo opcional com proporção correta
          let logoW = 0
          let logoH = 0
          if (logoLoaded) {
            const maxW = 260
            const maxH = headerHeight - 28
            const ratio = Math.min(maxW / logoLoaded.w, maxH / logoLoaded.h)
            logoW = Math.round(logoLoaded.w * ratio)
            logoH = Math.round(logoLoaded.h * ratio)
            const logoY = Math.round((headerHeight - logoH) / 2)
            try { pdf.addImage(logoLoaded.dataUrl, 'PNG', marginX, logoY, logoW, logoH) } catch {}
          }
          pdf.setTextColor('#ffffff')
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(16)
          const textLeft = marginX + (logoW > 0 ? (logoW + 16) : 0)
          pdf.text(reportTitle, textLeft, 36)
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(11)
          pdf.text(`Período: ${periodLabel}`, textLeft, 54)
          pdf.text(`Departamento: ${deptLabel}`, textLeft + 260, 54)

          // Conteúdo
          pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)

          // Footer elegante
          pdf.setDrawColor(subtle)
          pdf.line(marginX, pageHeight - footerHeight, pageWidth - marginX, pageHeight - footerHeight)
          pdf.setFontSize(10)
          pdf.setTextColor(accent)
          // data/hora à esquerda
          pdf.text(`Gerado em ${generatedAt}`, marginX, pageHeight - footerHeight + 22)
          // página ao centro
          pdf.text(`${i + 1} / ${sections.length}`, pageWidth / 2, pageHeight - footerHeight + 22, { align: 'center' as any })
          // marca/assinatura à direita
          pdf.setTextColor(primary)
          pdf.text('Sistema de RH', pageWidth - marginX, pageHeight - footerHeight + 22, { align: 'right' as any })
        }

        pdf.save(`relatorio-overview-${selectedPeriod}.pdf`)
        toast.success('PDF gerado com sucesso')
      } else {
        // Exportar CSV simples (compatível com Excel)
        const rows: Array<Record<string, any>> = []
        if (selectedReport === 'overview') {
          if (Array.isArray(performanceTrend)) rows.push(...performanceTrend)
        } else if (selectedReport === 'traffic' && Array.isArray(traffic)) {
          rows.push(...traffic)
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
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-rich-black-900">Visualize métricas e gere relatórios detalhado</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => handleExport('pdf')}
            variant="primary"
            size="sm"
            disabled={loading || exporting}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button 
            onClick={() => handleExport('excel')}
            variant="primary"
            size="sm"
            disabled={loading || exporting}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button
            onClick={async () => {
              try {
                setInsightsLoading(true)
                setInsights(null)
                const payload = selectedReport === 'traffic'
                  ? {
                      period: `${trafficStart}..${trafficEnd}`,
                      traffic: traffic,
                      totals: trafficTotals,
                      type: 'traffic'
                    }
                  : {
                      period: selectedPeriod,
                      departmentId: selectedDepartment !== 'all' ? selectedDepartment : undefined,
                      overviewSample: {
                        performanceTrend: (reportData as any).performanceTrend || [],
                        topPerformers: reportData.topPerformers || [],
                        departmentDistribution: reportData.departmentDistribution || [],
                        totals: {
                          employees: reportData.totalEmployees,
                          evaluations: reportData.totalEvaluations,
                        }
                      },
                      type: 'overview'
                    }
                const resp = await fetch('/api/reports/insights', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                })
                const data = await resp.json()
                if (!resp.ok) throw new Error(data?.error || 'Falha ao gerar insights')
                setInsights(data?.insights || null)
              } catch (e: any) {
                toast.error(e?.message || 'Falha ao gerar insights')
              } finally {
                setInsightsLoading(false)
              }
            }}
            variant="outline"
            size="sm"
            disabled={loading || insightsLoading}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            {insightsLoading ? 'Gerando...' : 'Gerar insights'}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
          { id: 'traffic', name: 'Tráfego Pago', icon: Activity },
        ].map((type) => {
          const Icon = type.icon as any
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
          {selectedReport === 'overview' && (
           <select
             value={selectedPeriod}
             onChange={(e) => setSelectedPeriod(e.target.value)}
             className="custom-select px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:ring-2 focus:ring-yinmn-blue-500 focus:border-yinmn-blue-500 appearance-none pr-8 min-w-[180px]"
           >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>)}
          {selectedReport === 'overview' && (
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
          )}
          {selectedReport === 'traffic' && (
            <div className="flex items-center gap-2 w-full">
              <input type="date" value={trafficStart} onChange={(e) => setTrafficStart(e.target.value)} className="px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:ring-2 focus:ring-yinmn-blue-500 focus:border-yinmn-blue-500" />
              <span className="text-oxford-blue-600">até</span>
              <input type="date" value={trafficEnd} onChange={(e) => setTrafficEnd(e.target.value)} className="px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:ring-2 focus:ring-yinmn-blue-500 focus:border-yinmn-blue-500" />
              <Button
                onClick={() => setShowTrafficModal(true)}
                variant="primary"
                size="sm"
                disabled={loading || exporting}
                className="ml-auto"
              >
                + Adicionar dados
              </Button>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yinmn-blue-500"></div>
          <span className="ml-2 text-rich-black-900">Carregando dados...</span>
        </div>
      )}

      {selectedReport === 'overview' && !loading && (
        <div ref={reportContainerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

          <div className="card p-6" ref={distributionRef}>
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

          <div className="card p-6 lg:col-span-2" ref={topRef}>
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

          {/* Insights gerados por IA */}
          <div className="card p-6 lg:col-span-2" ref={insightsRef}>
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Insights Powered by OpenAI</h3>
            {insightsLoading ? (
              <div className="text-oxford-blue-600">Gerando análise...</div>
            ) : insights ? (
              <div className="space-y-4">
                {Array.isArray(insights?.insights) && insights.insights.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-rich-black-900 mb-2">Insights</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {insights.insights.map((it: any, idx: number) => (
                        <li key={idx}>
                          {it?.title ? (<><span className="font-semibold">{it.title}:</span> </>) : null}
                          <span className="text-oxford-blue-700">{it?.detail}</span>
                        </li>
                      ))}
                    </ul>
        </div>
      )}
                {Array.isArray(insights?.recommendations) && insights.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-rich-black-900 mb-2">Recomendações Práticas</h4>
                    <ol className="list-decimal pl-5 space-y-1">
                      {insights.recommendations.map((rec: any, idx: number) => (
                        <li key={idx} className="text-oxford-blue-700">{rec}</li>
                      ))}
                    </ol>
              </div>
            )}
                {insights?.risk && (
                  <div>
                    <h4 className="font-semibold text-rich-black-900 mb-2">Alerta de Risco</h4>
                    <p className="text-oxford-blue-700">{insights.risk}</p>
        </div>
      )}
                {!insights?.insights?.length && !insights?.recommendations?.length && !insights?.risk && (
                  <p className="text-oxford-blue-600">Sem conteúdo.</p>
            )}
          </div>
            ) : (
              <div className="text-oxford-blue-600">Clique em "Gerar insights" para produzir a análise contextual com base nos dados atuais.</div>
            )}
          </div>
        </div>
      )}

      {selectedReport === 'traffic' && !loading && (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4" ref={trafficCardsRef}>
            <div className="card p-4"><div className="text-xs text-oxford-blue-600">Gasto</div><div className="text-xl font-semibold text-rich-black-900">R$ {trafficTotals.spent?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div></div>
            <div className="card p-4"><div className="text-xs text-oxford-blue-600">Reuniões Agendadas</div><div className="text-xl font-semibold text-rich-black-900">{trafficTotals.meetingsScheduled}</div></div>
            <div className="card p-4"><div className="text-xs text-oxford-blue-600">Reuniões Realizadas</div><div className="text-xl font-semibold text-rich-black-900">{trafficTotals.meetingsHeld}</div></div>
            <div className="card p-4"><div className="text-xs text-oxford-blue-600">Ctt Mãe</div><div className="text-xl font-semibold text-rich-black-900">{trafficTotals.motherContacts}</div></div>
            <div className="card p-4"><div className="text-xs text-oxford-blue-600">1ª Op</div><div className="text-xl font-semibold text-rich-black-900">{trafficTotals.firstOp}</div></div>
          </div>

          <div className="card p-6" ref={trafficChartRef}>
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Evolução Diária</h3>
            {traffic.length > 0 ? (
              <ResponsiveContainer width="100%" height={380}>
                <LineChart data={traffic}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                  <Legend iconType="plainline" />
                  <Line type="monotone" dataKey="spent" name="Gasto" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="meetingsScheduled" name="Reuniões Ag." stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="meetingsHeld" name="Reuniões Real." stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="motherContacts" name="Ctt Mãe" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="firstOp" name="1ª Op" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[380px] text-oxford-blue-600">Sem dados no período</div>
            )}
          </div>

          <div className="card p-6" ref={trafficTableRef}>
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Tabela Diária</h3>
            {traffic.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-xs font-medium text-oxford-blue-600 uppercase tracking-wider">
                    <tr className="border-b border-neutral-800">
                      <th className="pb-3">Data</th>
                      <th className="pb-3">Gasto</th>
                      <th className="pb-3">Reuniões Agendadas</th>
                      <th className="pb-3">Reuniões Realizadas</th>
                      <th className="pb-3">Ctt Mãe</th>
                      <th className="pb-3">1ª Op</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {[...traffic].reverse().map((d: any, idx: number) => (
                      <tr key={idx} className="text-sm">
                        <td className="py-3 text-rich-black-900 font-medium">{new Date(d.date).toLocaleDateString('pt-BR')}</td>
                        <td className="py-3 text-oxford-blue-600">R$ {Number(d.spent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 text-oxford-blue-600">{d.meetingsScheduled}</td>
                        <td className="py-3 text-oxford-blue-600">{d.meetingsHeld}</td>
                        <td className="py-3 text-oxford-blue-600">{d.motherContacts}</td>
                        <td className="py-3 text-oxford-blue-600">{d.firstOp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-oxford-blue-600">Sem dados</div>
            )}
          </div>
        </div>
      )}

      {/* Modal adicionar dados de Tráfego */}
      {showTrafficModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Adicionar dados - Tráfego Pago</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-oxford-blue-600">Data</label>
                <input type="date" value={trafficForm.date} onChange={(e)=>setTrafficForm({...trafficForm, date:e.target.value})} className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-oxford-blue-600">Gasto (R$)</label>
                <input type="number" step="0.01" value={trafficForm.spent} onChange={(e)=>setTrafficForm({...trafficForm, spent:e.target.value})} className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-oxford-blue-600">Reuniões Agendadas</label>
                <input type="number" value={trafficForm.meetingsScheduled} onChange={(e)=>setTrafficForm({...trafficForm, meetingsScheduled:e.target.value})} className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-oxford-blue-600">Reuniões Realizadas</label>
                <input type="number" value={trafficForm.meetingsHeld} onChange={(e)=>setTrafficForm({...trafficForm, meetingsHeld:e.target.value})} className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-oxford-blue-600">Ctt Mãe</label>
                <input type="number" value={trafficForm.motherContacts} onChange={(e)=>setTrafficForm({...trafficForm, motherContacts:e.target.value})} className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg" />
              </div>
              <div>
                <label className="text-xs text-oxford-blue-600">1ª Op</label>
                <input type="number" value={trafficForm.firstOp} onChange={(e)=>setTrafficForm({...trafficForm, firstOp:e.target.value})} className="w-full px-3 py-2 bg-white border border-platinum-300 rounded-lg" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={()=>setShowTrafficModal(false)}>Cancelar</Button>
              <Button
                variant="primary" size="sm"
                onClick={async ()=>{
                  try{
                    const resp = await fetch('/api/traffic',{
                      method:'POST', headers:{'Content-Type':'application/json'},
                      body: JSON.stringify({
                        date: trafficForm.date,
                        spent: Number(trafficForm.spent||0),
                        meetingsScheduled: Number(trafficForm.meetingsScheduled||0),
                        meetingsHeld: Number(trafficForm.meetingsHeld||0),
                        motherContacts: Number(trafficForm.motherContacts||0),
                        firstOp: Number(trafficForm.firstOp||0),
                      })
                    })
                    const data = await resp.json()
                    if(!resp.ok){ throw new Error(data?.error || 'Falha ao salvar') }
                    toast.success('Dados salvos')
                    setShowTrafficModal(false)
                    // refresh
                    setTrafficEnd(prev=>prev)
                  }catch(e:any){ toast.error(e?.message||'Erro ao salvar') }
                }}
              >
                Salvar
              </Button>
              </div>
          </div>
        </div>
      )}

      {/* Outras abas removidas: Performance, Análise CHA, Metas e Departamentos */}
      <div className="h-10" />
    </div>
  )
}
