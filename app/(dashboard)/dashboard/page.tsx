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
  })
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        // Tentar usar dados do user_metadata como fallback
        const metaName = user.user_metadata?.full_name || user.user_metadata?.name
        if (metaName) {
          setUserProfile({ full_name: metaName })
        }
      } else {
        setUserProfile(profile)
      }

      // Simular dados
      setData({
        totalEmployees: 45,
        activeEvaluations: 12,
        completedGoals: 28,
        averageScore: 8.5,
        recentEvaluations: [
          { id: 1, employee: 'João Silva', department: 'Vendas', date: '15/01/2024', score: 8.7, change: 0.3 },
          { id: 2, employee: 'Maria Santos', department: 'Marketing', date: '14/01/2024', score: 9.2, change: 0.5 },
          { id: 3, employee: 'Pedro Costa', department: 'TI', date: '13/01/2024', score: 7.8, change: -0.2 },
          { id: 4, employee: 'Ana Oliveira', department: 'RH', date: '12/01/2024', score: 8.9, change: 0.1 },
        ],
        upcomingDeadlines: [
          { id: 1, title: 'Avaliação Trimestral', date: '31/01/2024', type: 'evaluation' },
          { id: 2, title: 'Revisão de Metas', date: '15/02/2024', type: 'goal' },
          { id: 3, title: 'Feedback 360°', date: '20/02/2024', type: 'feedback' },
        ],
        performanceTrend: 12.5,
      })
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Colaboradores',
      value: data.totalEmployees,
      icon: Users,
      change: '+3',
      changeValue: 7.1,
      positive: true,
    },
    {
      title: 'Avaliações Ativas',
      value: data.activeEvaluations,
      icon: Activity,
      change: '+2',
      changeValue: 20,
      positive: true,
    },
    {
      title: 'Metas Concluídas',
      value: data.completedGoals,
      icon: Target,
      change: '+5',
      changeValue: 21.7,
      positive: true,
    },
    {
      title: 'Média Geral',
      value: data.averageScore.toFixed(1),
      icon: Award,
      change: '+0.3',
      changeValue: 3.6,
      positive: true,
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-neutral-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statsCards.map((stat) => (
          <div key={stat.title} className="card-elegant p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl flex items-center justify-center shadow-sm">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <span className={`text-xs font-light flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-sm ${
                stat.positive ? 'text-green-700 bg-green-50/80 border border-green-200/50' : 'text-red-700 bg-red-50/80 border border-red-200/50'
              }`}>
                {stat.positive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                <span className="tracking-wide">{stat.changeValue}%</span>
              </span>
            </div>
            <div>
              <p className="text-4xl font-roboto text-slate-900 mb-3 tracking-tight" style={{ fontWeight: 100 }}>{stat.value}</p>
              <p className="text-sm font-roboto font-light text-slate-500 tracking-wide">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Evaluations */}
        <div className="lg:col-span-2 card-elegant">
          <div className="p-10 border-b border-slate-100/60">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-roboto text-slate-900 tracking-tight" style={{ fontWeight: 300 }}>Avaliações Recentes</h2>
              <Link href="/evaluations" className="text-sm font-light text-blue-600 hover:text-blue-700 tracking-wide">
                Ver todas
              </Link>
            </div>
          </div>
          <div className="p-10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-light text-slate-500 uppercase tracking-widest">
                    <th className="pb-6 font-light">Colaborador</th>
                    <th className="pb-6 font-light">Departamento</th>
                    <th className="pb-6 font-light">Data</th>
                    <th className="pb-6 text-right font-light">Nota</th>
                    <th className="pb-6 text-right font-light">Variação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.recentEvaluations.map((evaluation) => (
                    <tr key={evaluation.id} className="text-sm hover:bg-slate-50/50 transition-all duration-300">
                      <td className="py-6">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200/50 flex items-center justify-center text-xs font-light text-blue-700 shadow-sm">
                            {evaluation.employee.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="ml-5 font-light text-slate-900 tracking-wide">{evaluation.employee}</span>
                        </div>
                      </td>
                      <td className="py-6 text-slate-600 font-light tracking-wide">{evaluation.department}</td>
                      <td className="py-6 text-slate-600 font-light tracking-wide">{evaluation.date}</td>
                      <td className="py-6 text-right">
                        <span className="font-light text-slate-900 text-base">{evaluation.score}</span>
                      </td>
                      <td className="py-6 text-right">
                        <span className={`inline-flex items-center text-xs font-light px-3 py-1.5 rounded-full backdrop-blur-sm ${
                          evaluation.change >= 0 ? 'text-green-700 bg-green-50/80 border border-green-200/50' : 'text-red-700 bg-red-50/80 border border-red-200/50'
                        }`}>
                          <span className="tracking-wide">{evaluation.change >= 0 ? '+' : ''}{evaluation.change}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card-elegant">
          <div className="p-10 border-b border-slate-100/60">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-roboto text-slate-900 tracking-tight" style={{ fontWeight: 300 }}>Próximos Prazos</h2>
              <button className="text-slate-400 hover:text-slate-600 transition-colors duration-300">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="p-10">
            <div className="space-y-8">
              {data.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-start space-x-6 group hover:bg-slate-50/50 -mx-4 px-4 py-4 rounded-2xl transition-all duration-300">
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-3xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                      <Clock className="h-7 w-7 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-light text-slate-900 tracking-wide">
                      {deadline.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-2 font-light tracking-wide">
                      {deadline.date}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-light backdrop-blur-sm border ${
                    deadline.type === 'evaluation' ? 'bg-blue-50/80 text-blue-700 border-blue-200/50' :
                    deadline.type === 'goal' ? 'bg-green-50/80 text-green-700 border-green-200/50' :
                    'bg-amber-50/80 text-amber-700 border-amber-200/50'
                  }`}>
                    <span className="tracking-wide">
                      {deadline.type === 'evaluation' ? 'Avaliação' :
                       deadline.type === 'goal' ? 'Meta' :
                       'Feedback'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="card-elegant">
        <div className="p-10 border-b border-slate-100/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-roboto text-slate-900 tracking-tight" style={{ fontWeight: 300 }}>Tendência de Desempenho</h2>
              <p className="text-sm text-slate-500 mt-3 font-light tracking-wide">Últimos 12 meses</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-4xl font-roboto text-slate-900 tracking-tight" style={{ fontWeight: 100 }}>
                {data.performanceTrend > 0 ? '+' : ''}{data.performanceTrend}%
              </span>
              {data.performanceTrend > 0 ? (
                <div className="h-16 w-16 bg-gradient-to-br from-green-50 to-green-100/50 rounded-3xl flex items-center justify-center shadow-sm">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="h-16 w-16 bg-gradient-to-br from-red-50 to-red-100/50 rounded-3xl flex items-center justify-center shadow-sm">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-10">
          <div className="h-96 flex items-center justify-center bg-gradient-to-br from-slate-50/50 to-slate-100/30 rounded-3xl border border-slate-100/60">
            {/* Placeholder para gráfico */}
            <div className="text-center">
              <div className="h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <BarChart3 className="h-10 w-10 text-slate-400" />
              </div>
              <p className="text-base font-light text-slate-600 tracking-wide">Gráfico de tendências</p>
              <p className="text-sm text-slate-400 mt-2 font-light tracking-wide">Em breve</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link href="/evaluations/new" className="group">
          <div className="card-elegant p-8 group-hover:border-blue-200/80">
            <div className="flex items-center space-x-6">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200/60 transition-all duration-500 shadow-sm group-hover:shadow-md">
                <ClipboardCheck className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-roboto font-light text-slate-900 text-lg tracking-wide">Nova Avaliação</h3>
                <p className="text-sm text-slate-500 font-roboto font-light tracking-wide mt-1">Criar nova avaliação</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/goals/new" className="group">
          <div className="card-elegant p-8 group-hover:border-green-200/80">
            <div className="flex items-center space-x-6">
              <div className="h-16 w-16 bg-gradient-to-br from-green-50 to-green-100/50 rounded-3xl flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200/60 transition-all duration-500 shadow-sm group-hover:shadow-md">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-roboto font-light text-slate-900 text-lg tracking-wide">Criar Meta</h3>
                <p className="text-sm text-slate-500 font-roboto font-light tracking-wide mt-1">Definir nova meta</p>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/reports" className="group">
          <div className="card-elegant p-8 group-hover:border-purple-200/80">
            <div className="flex items-center space-x-6">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl flex items-center justify-center group-hover:from-purple-100 group-hover:to-purple-200/60 transition-all duration-500 shadow-sm group-hover:shadow-md">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-roboto font-light text-slate-900 text-lg tracking-wide">Gerar Relatório</h3>
                <p className="text-sm text-slate-500 font-roboto font-light tracking-wide mt-1">Criar relatório</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}