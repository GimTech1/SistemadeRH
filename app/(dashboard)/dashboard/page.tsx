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
  activeEvaluations: number
  completedGoals: number
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
    activeEvaluations: 0,
    completedGoals: 0,
    averageScore: 0,
    recentEvaluations: [],
    upcomingDeadlines: [],
    performanceTrend: 0,
    departmentBreakdown: [],
    monthlyData: [],
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('Este mês')
  const [selectedView, setSelectedView] = useState('Departamento')
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Simular dados
      setData({
        totalEmployees: 145,
        activeEvaluations: 23,
        completedGoals: 89,
        averageScore: 8.7,
        recentEvaluations: [],
        upcomingDeadlines: [],
        performanceTrend: 15.3,
        departmentBreakdown: [
          { name: 'Vendas', value: 35, color: 'bg-yinmn-blue-500' },
          { name: 'TI', value: 25, color: 'bg-silver-lake-blue-500' },
          { name: 'Marketing', value: 20, color: 'bg-emerald-500' },
          { name: 'RH', value: 12, color: 'bg-amber-500' },
          { name: 'Outros', value: 8, color: 'bg-purple-500' },
        ],
        monthlyData: [
          { month: 'Jan', value: 65, target: 60 },
          { month: 'Fev', value: 70, target: 65 },
          { month: 'Mar', value: 75, target: 70 },
          { month: 'Abr', value: 82, target: 75 },
          { month: 'Mai', value: 88, target: 80 },
          { month: 'Jun', value: 95, target: 85 },
        ],
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Colaboradores',
      value: '145',
      subtitle: 'Total de funcionários',
      change: '+8%',
      changeText: 'do mês anterior',
      positive: true,
      color: 'border-l-[#415A77]',
      icon: Users,
      iconColor: 'text-[#778DA9]',
      iconBg: 'bg-[#E0E1DD]',
    },
    {
      title: 'Avaliações',
      value: '23',
      subtitle: 'Avaliações ativas',
      change: '+12%',
      changeText: 'do mês anterior',
      positive: true,
      color: 'border-l-[#415A77]',
      icon: ClipboardCheck,
      iconColor: 'text-[#778DA9]',
      iconBg: 'bg-[#E0E1DD]',
    },
    {
      title: 'Metas',
      value: '89',
      subtitle: 'Metas concluídas',
      change: '+5%',
      changeText: 'do mês anterior',
      positive: true,
      color: 'border-l-[#415A77]',
      icon: Target,
      iconColor: 'text-[#778DA9]',
      iconBg: 'bg-[#E0E1DD]',
    },
    {
      title: 'Performance',
      value: '8.7',
      subtitle: 'Média geral',
      change: '+3%',
      changeText: 'do mês anterior',
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
      {/* Header com título e controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-tight">Visão geral de desempenho e métricas</h1>

        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <label className="block text-xs font-roboto font-medium text-oxford-blue-500 mb-1">Ver por</label>
            <select 
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
              className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
            >
              <option>Departamento</option>
              <option>Função</option>
              <option>Localização</option>
            </select>
          </div>
          <div className="relative">
            <label className="block text-xs font-roboto font-medium text-oxford-blue-500 mb-1">Período</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
            >
              <option>Este mês</option>
              <option>Último trimestre</option>
              <option>Este ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className={`bg-white rounded-lg border-l-4 ${stat.color} p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-3xl font-roboto font-bold text-rich-black-900">{stat.value}</p>
                    <p className="text-base font-roboto font-medium text-rich-black-900">{stat.title}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-roboto font-light text-oxford-blue-500">{stat.subtitle}</p>
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-roboto font-medium ${stat.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm font-roboto font-light text-oxford-blue-400">{stat.changeText}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Seção principal com gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Breakdown de Performance */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Breakdown de Performance</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-500 mt-1">Comparado ao período anterior</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-platinum-50 rounded-lg transition-colors">
                  <Download className="w-4 h-4 text-oxford-blue-400" />
                </button>
                <button className="p-2 hover:bg-platinum-50 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-oxford-blue-400" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-roboto font-medium text-oxford-blue-500">Performance Atual</span>
                <span className="text-2xl font-roboto font-semibold text-rich-black-900">87.5%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-roboto font-medium text-oxford-blue-500">Meta</span>
                <span className="text-xl font-roboto font-medium text-oxford-blue-600">85.0%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-roboto font-medium text-emerald-600">Meta</span>
                <span className="text-xl font-roboto font-semibold text-emerald-600">103%</span>
              </div>
            </div>
            
            {/* Gráfico de barras simulado */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-roboto font-medium text-oxford-blue-400 uppercase tracking-wider">
                <span>0</span>
                <span>20</span>
                <span>40</span>
                <span>60</span>
                <span>80</span>
                <span>100</span>
              </div>
              <div className="space-y-3">
                {data.monthlyData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-8 text-xs font-roboto font-medium text-oxford-blue-600">{item.month}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-platinum-100 rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-yinmn-blue-400 to-yinmn-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${item.value}%` }}
                        ></div>
                        <div 
                          className="absolute top-0 bg-gradient-to-r from-platinum-300 to-platinum-400 h-full w-1 transition-all duration-500"
                          style={{ left: `${item.target}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-roboto font-medium text-rich-black-900 w-8">{item.value}</span>
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
        <div className="bg-white rounded-lg shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Departamentos</h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-500 mt-1">Distribuição por área</p>
              </div>
              <button className="p-2 hover:bg-platinum-50 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-oxford-blue-400" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {/* Gráfico de pizza simulado */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="w-full h-full rounded-full relative overflow-hidden" style={{
                background: `conic-gradient(
                  #3B82F6 0% 35%, 
                  #06B6D4 35% 60%, 
                  #10B981 60% 80%, 
                  #F59E0B 80% 92%, 
                  #8B5CF6 92% 100%
                )`
              }}>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-roboto font-semibold text-rich-black-900">145</div>
                    <div className="text-xs font-roboto font-medium text-oxford-blue-500">Total</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legenda */}
            <div className="space-y-3">
              {data.departmentBreakdown.map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                    <span className="text-sm font-roboto font-medium text-rich-black-900">{dept.name}</span>
                  </div>
                  <span className="text-sm font-roboto font-medium text-oxford-blue-600">{dept.value}</span>
                </div>
              ))}
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

      {/* Avaliações Recentes e Próximos Prazos */}
      <div className="grid grid-cols-1 gap-6">
        {/* Avaliações Recentes */}
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
                  {[
                    { name: 'João Silva', department: 'Vendas', score: 8.7, date: '15/01/2024', change: '+0.3' },
                    { name: 'Maria Santos', department: 'Marketing', score: 9.2, date: '14/01/2024', change: '+0.5' },
                    { name: 'Pedro Costa', department: 'TI', score: 7.8, date: '13/01/2024', change: '-0.2' },
                    { name: 'Ana Oliveira', department: 'RH', score: 8.9, date: '12/01/2024', change: '+0.1' },
                  ].map((evaluation, index) => (
                    <tr key={index} className="text-sm hover:bg-platinum-50/50 transition-colors">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yinmn-blue-100 to-yinmn-blue-200/50 flex items-center justify-center text-sm font-roboto font-medium text-yinmn-blue-700">
                            {evaluation.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-roboto font-medium text-rich-black-900">{evaluation.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-oxford-blue-600 font-roboto font-light">{evaluation.department}</td>
                      <td className="py-4 text-oxford-blue-600 font-roboto font-light">{evaluation.date}</td>
                      <td className="py-4 text-right">
                        <span className="font-roboto font-semibold text-rich-black-900">{evaluation.score}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`inline-flex items-center text-xs font-roboto font-medium px-3 py-1 rounded-full ${
                          evaluation.change.startsWith('+') 
                            ? 'text-emerald-700 bg-emerald-50/80 border border-emerald-200/50' 
                            : 'text-red-700 bg-red-50/80 border border-red-200/50'
                        }`}>
                          {evaluation.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Próximos Prazos */}
        <div className="bg-white rounded-lg shadow-sm border border-platinum-200">
          <div className="p-6 border-b border-platinum-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Próximos Prazos</h3>
              <button className="p-1 hover:bg-platinum-50 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-oxford-blue-400" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
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
                  {[
                    { title: 'Avaliação Trimestral', date: '31/01/2024', type: 'evaluation', daysLeft: 5, status: 'Urgente' },
                    { title: 'Revisão de Metas', date: '15/02/2024', type: 'goal', daysLeft: 20, status: 'Em andamento' },
                    { title: 'Feedback 360°', date: '20/02/2024', type: 'feedback', daysLeft: 25, status: 'Planejado' },
                    { title: 'Relatório Mensal', date: '28/02/2024', type: 'report', daysLeft: 33, status: 'Planejado' },
                  ].map((deadline, index) => (
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
                          deadline.type === 'feedback' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                          'bg-purple-50 text-purple-700 border border-purple-200/50'
                  }`}>
                    {deadline.type === 'evaluation' ? 'Avaliação' :
                     deadline.type === 'goal' ? 'Meta' :
                           deadline.type === 'feedback' ? 'Feedback' : 'Relatório'}
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
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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