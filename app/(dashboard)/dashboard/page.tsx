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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Bem-vindo, {userProfile?.full_name || userProfile?.email || 'Usuário'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.title} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-neutral-800 rounded-lg flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-neutral-400" />
              </div>
              <span className={`text-xs font-medium flex items-center gap-1 ${
                stat.positive ? 'text-success-500' : 'text-danger-500'
              }`}>
                {stat.positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {stat.changeValue}%
              </span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-50">{stat.value}</p>
              <p className="text-sm text-neutral-400 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Evaluations */}
        <div className="lg:col-span-2 card">
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Avaliações Recentes</h2>
              <Link href="/evaluations" className="text-sm text-primary-500 hover:text-primary-400">
                Ver todas
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    <th className="pb-3">Colaborador</th>
                    <th className="pb-3">Departamento</th>
                    <th className="pb-3">Data</th>
                    <th className="pb-3 text-right">Nota</th>
                    <th className="pb-3 text-right">Variação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {data.recentEvaluations.map((evaluation) => (
                    <tr key={evaluation.id} className="text-sm">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium text-neutral-300">
                            {evaluation.employee.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <span className="ml-3 text-neutral-200">{evaluation.employee}</span>
                        </div>
                      </td>
                      <td className="py-3 text-neutral-400">{evaluation.department}</td>
                      <td className="py-3 text-neutral-400">{evaluation.date}</td>
                      <td className="py-3 text-right">
                        <span className="font-medium text-neutral-200">{evaluation.score}</span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center text-xs font-medium ${
                          evaluation.change >= 0 ? 'text-success-500' : 'text-danger-500'
                        }`}>
                          {evaluation.change >= 0 ? '+' : ''}{evaluation.change}
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
        <div className="card">
          <div className="p-6 border-b border-neutral-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Próximos Prazos</h2>
              <button className="text-neutral-500 hover:text-neutral-300">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <Clock className="h-4 w-4 text-neutral-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-200">
                      {deadline.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {deadline.date}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    deadline.type === 'evaluation' ? 'badge-primary' :
                    deadline.type === 'goal' ? 'badge-success' :
                    'badge-warning'
                  }`}>
                    {deadline.type === 'evaluation' ? 'Avaliação' :
                     deadline.type === 'goal' ? 'Meta' :
                     'Feedback'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Trend */}
      <div className="card">
        <div className="p-6 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tendência de Desempenho</h2>
              <p className="text-sm text-neutral-400 mt-1">Últimos 12 meses</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-semibold text-neutral-50">
                {data.performanceTrend > 0 ? '+' : ''}{data.performanceTrend}%
              </span>
              {data.performanceTrend > 0 ? (
                <TrendingUp className="h-5 w-5 text-success-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-danger-500" />
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center text-neutral-600">
            {/* Placeholder para gráfico */}
            <p className="text-sm">Gráfico de tendências</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/evaluations/new">
          <button className="w-full btn-secondary">
            Nova Avaliação
          </button>
        </Link>
        <Link href="/goals/new">
          <button className="w-full btn-secondary">
            Criar Meta
          </button>
        </Link>
        <Link href="/reports">
          <button className="w-full btn-secondary">
            Gerar Relatório
          </button>
        </Link>
      </div>
    </div>
  )
}