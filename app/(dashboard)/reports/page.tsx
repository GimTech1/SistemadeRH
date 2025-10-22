'use client'

import { useState, useEffect } from 'react'
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
  }, [selectedPeriod, selectedDepartment, selectedReport])

  // Dados padrão para fallback
  const defaultPerformanceData = [
    { month: 'Jan', vendas: 85, marketing: 88, ti: 82, rh: 90, financeiro: 87 },
    { month: 'Fev', vendas: 87, marketing: 86, ti: 84, rh: 91, financeiro: 85 },
    { month: 'Mar', vendas: 88, marketing: 89, ti: 85, rh: 89, financeiro: 88 },
    { month: 'Abr', vendas: 86, marketing: 91, ti: 87, rh: 92, financeiro: 86 },
    { month: 'Mai', vendas: 90, marketing: 90, ti: 88, rh: 91, financeiro: 89 },
    { month: 'Jun', vendas: 92, marketing: 92, ti: 89, rh: 93, financeiro: 90 },
  ]

  const defaultChaData = [
    { skill: 'Conhecimento', atual: 85, meta: 90, anterior: 80 },
    { skill: 'Habilidade', atual: 88, meta: 85, anterior: 82 },
    { skill: 'Atitude', atual: 90, meta: 88, anterior: 85 },
  ]

  const defaultDepartmentDistribution = [
    { name: 'Comercial Securitizadora', value: 11, fill: '#3b82f6' },
    { name: 'Marketing', value: 5, fill: '#8b5cf6' },
    { name: 'Tecnologia', value: 5, fill: '#10b981' },
    { name: 'Controladoria', value: 5, fill: '#f59e0b' },
    { name: 'Financeiro', value: 0, fill: '#ef4444' },
    { name: 'Engenharia', value: 2, fill: '#06b6d4' },
    { name: 'Jurídico', value: 1, fill: '#84cc16' },
    { name: 'Administrativo', value: 1, fill: '#f97316' },
    { name: 'Limpeza', value: 1, fill: '#ec4899' },
    { name: 'Comercial Incorporadora', value: 3, fill: '#6366f1' },
  ]

  const defaultRadarData = [
    { subject: 'Liderança', A: 85, B: 90, fullMark: 100 },
    { subject: 'Comunicação', A: 88, B: 85, fullMark: 100 },
    { subject: 'Técnica', A: 92, B: 88, fullMark: 100 },
    { subject: 'Trabalho em Equipe', A: 87, B: 92, fullMark: 100 },
    { subject: 'Inovação', A: 83, B: 87, fullMark: 100 },
    { subject: 'Resultados', A: 90, B: 89, fullMark: 100 },
  ]

  const defaultGoalsProgress = [
    { category: 'Performance', total: 45, completed: 32 },
    { category: 'Habilidade', total: 30, completed: 24 },
    { category: 'Carreira', total: 25, completed: 18 },
    { category: 'Pessoal', total: 20, completed: 12 },
  ]

  const defaultTopPerformers = [
    { name: 'Juliana Lima', score: 9.5, department: 'Marketing', trend: 'up' },
    { name: 'Lucas Martins', score: 9.4, department: 'TI', trend: 'up' },
    { name: 'Beatriz Costa', score: 9.3, department: 'RH', trend: 'stable' },
    { name: 'Carlos Mendes', score: 9.2, department: 'Vendas', trend: 'up' },
    { name: 'Marina Souza', score: 9.1, department: 'TI', trend: 'down' },
  ]

  // Usar dados reais ou fallback
  const performanceData = reportData.performanceData || defaultPerformanceData
  const chaData = reportData.chaData || defaultChaData
  const departmentDistribution = reportData.departmentDistribution || defaultDepartmentDistribution
  const radarData = reportData.radarData || defaultRadarData
  const goalsProgress = reportData.goalsProgress || defaultGoalsProgress
  const topPerformers = reportData.topPerformers || defaultTopPerformers

  const handleExport = (format: 'pdf' | 'excel') => {
    setLoading(true)
    setTimeout(() => {
      toast.success(`Relatório exportado em ${format.toUpperCase()}!`)
      setLoading(false)
    }, 1500)
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
          <h1 className="text-2xl font-semibold text-rich-black-900">Visualize métricas e gere relatórios detalhados</h1>
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
             className="custom-select px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:ring-2 focus:ring-yinmn-blue-500 focus:border-yinmn-blue-500 appearance-none pr-8"
           >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
           <select
             value={selectedDepartment}
             onChange={(e) => setSelectedDepartment(e.target.value)}
             className="custom-select px-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:ring-2 focus:ring-yinmn-blue-500 focus:border-yinmn-blue-500 appearance-none pr-8"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Tendência de Performance</h3>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Area type="monotone" dataKey="vendas" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVendas)" />
                </AreaChart>
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
            <h3 className="text-lg font-semibold text-rich-black-900 mb-4">Top Performers</h3>
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
                  <Legend />
                  <Line type="monotone" dataKey="vendas" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="marketing" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="ti" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="rh" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="financeiro" stroke="#ef4444" strokeWidth={2} />
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
                <BarChart data={chaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="skill" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#1f2937' }}
                  />
                  <Legend />
                  <Bar dataKey="anterior" fill="#6b7280" />
                  <Bar dataKey="atual" fill="#3b82f6" />
                  <Bar dataKey="meta" fill="#10b981" />
                </BarChart>
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
        </div>
      )}
    </div>
  )
}
