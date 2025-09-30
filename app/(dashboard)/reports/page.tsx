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

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedReport, setSelectedReport] = useState('overview')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const performanceData = [
    { month: 'Jan', vendas: 85, marketing: 88, ti: 82, rh: 90, financeiro: 87 },
    { month: 'Fev', vendas: 87, marketing: 86, ti: 84, rh: 91, financeiro: 85 },
    { month: 'Mar', vendas: 88, marketing: 89, ti: 85, rh: 89, financeiro: 88 },
    { month: 'Abr', vendas: 86, marketing: 91, ti: 87, rh: 92, financeiro: 86 },
    { month: 'Mai', vendas: 90, marketing: 90, ti: 88, rh: 91, financeiro: 89 },
    { month: 'Jun', vendas: 92, marketing: 92, ti: 89, rh: 93, financeiro: 90 },
  ]

  const chaData = [
    { skill: 'Conhecimento', atual: 85, meta: 90, anterior: 80 },
    { skill: 'Habilidade', atual: 88, meta: 85, anterior: 82 },
    { skill: 'Atitude', atual: 90, meta: 88, anterior: 85 },
  ]

  const departmentDistribution = [
    { name: 'Vendas', value: 24, fill: '#3b82f6' },
    { name: 'Marketing', value: 18, fill: '#8b5cf6' },
    { name: 'TI', value: 32, fill: '#10b981' },
    { name: 'RH', value: 12, fill: '#f59e0b' },
    { name: 'Financeiro', value: 15, fill: '#ef4444' },
    { name: 'Operações', value: 28, fill: '#06b6d4' },
  ]

  const radarData = [
    { subject: 'Liderança', A: 85, B: 90, fullMark: 100 },
    { subject: 'Comunicação', A: 88, B: 85, fullMark: 100 },
    { subject: 'Técnica', A: 92, B: 88, fullMark: 100 },
    { subject: 'Trabalho em Equipe', A: 87, B: 92, fullMark: 100 },
    { subject: 'Inovação', A: 83, B: 87, fullMark: 100 },
    { subject: 'Resultados', A: 90, B: 89, fullMark: 100 },
  ]

  const goalsProgress = [
    { category: 'Performance', total: 45, completed: 32 },
    { category: 'Habilidade', total: 30, completed: 24 },
    { category: 'Carreira', total: 25, completed: 18 },
    { category: 'Pessoal', total: 20, completed: 12 },
  ]

  const topPerformers = [
    { name: 'Juliana Lima', score: 9.5, department: 'Marketing', trend: 'up' },
    { name: 'Lucas Martins', score: 9.4, department: 'TI', trend: 'up' },
    { name: 'Beatriz Costa', score: 9.3, department: 'RH', trend: 'stable' },
    { name: 'Carlos Mendes', score: 9.2, department: 'Vendas', trend: 'up' },
    { name: 'Marina Souza', score: 9.1, department: 'TI', trend: 'down' },
  ]

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
          <h1 className="text-2xl font-semibold text-black-50">Relatórios e Análises - PAGINA EM DESENVOLVIMENTO DESCONSIDERAR</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Visualize métricas e gere relatórios detalhados
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => handleExport('pdf')}
            className="btn-secondary"
            disabled={loading}
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="btn-primary"
            disabled={loading}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar Excel
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {reportTypes.map((type) => {
          const Icon = type.icon
          return (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                selectedReport === type.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {type.name}
            </button>
          )
        })}
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
          >
            <option value="all">Todos os Departamentos</option>
            <option value="vendas">Vendas</option>
            <option value="marketing">Marketing</option>
            <option value="ti">TI</option>
            <option value="rh">RH</option>
            <option value="financeiro">Financeiro</option>
          </select>
        </div>
      </div>

      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">Tendência de Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
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
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">Distribuição por Departamento</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">Top Performers</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
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
                      <td className="py-3 text-neutral-400">#{index + 1}</td>
                      <td className="py-3 text-neutral-200 font-medium">{performer.name}</td>
                      <td className="py-3 text-neutral-400">{performer.department}</td>
                      <td className="py-3">
                        <span className="text-yellow-500 font-semibold">{performer.score}</span>
                      </td>
                      <td className="py-3">
                        {performer.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                        {performer.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                        {performer.trend === 'stable' && <Activity className="h-4 w-4 text-neutral-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">Performance por Departamento</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
                <Line type="monotone" dataKey="vendas" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="marketing" stroke="#8b5cf6" strokeWidth={2} />
                <Line type="monotone" dataKey="ti" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="rh" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="financeiro" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'cha' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">Análise CHA</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="skill" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="anterior" fill="#6b7280" />
                <Bar dataKey="atual" fill="#3b82f6" />
                <Bar dataKey="meta" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">Competências</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis stroke="#374151" />
                <Radar name="Atual" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Radar name="Meta" dataKey="B" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'goals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">Progresso de Metas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalsProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#10b981" />
                <Bar dataKey="total" stackId="a" fill="#6b7280" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedReport === 'departments' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-neutral-200 mb-4">Análise Comparativa</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="vendas" fill="#3b82f6" />
                <Bar dataKey="marketing" fill="#8b5cf6" />
                <Bar dataKey="ti" fill="#10b981" />
                <Bar dataKey="rh" fill="#f59e0b" />
                <Bar dataKey="financeiro" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
