'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Award,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  Activity,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface RecentFeedback {
  id: string
  from: string
  to: string
  date: string
  score: number
  department: string
  type: 'sent' | 'received'
}

export default function FeedbackPage() {
  const [recentFeedbacks, setRecentFeedbacks] = useState<RecentFeedback[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = async () => {
    try {
      // Simular dados
      setRecentFeedbacks([
        {
          id: '1',
          from: 'João Silva',
          to: 'Maria Santos',
          date: '10/01/2024',
          score: 9.2,
          department: 'Marketing',
          type: 'sent',
        },
        {
          id: '2',
          from: 'Pedro Costa',
          to: 'João Silva',
          date: '09/01/2024',
          score: 8.8,
          department: 'TI',
          type: 'received',
        },
        {
          id: '3',
          from: 'Ana Oliveira',
          to: 'Carlos Mendes',
          date: '08/01/2024',
          score: 9.0,
          department: 'Vendas',
          type: 'sent',
        },
        {
          id: '4',
          from: 'Maria Santos',
          to: 'Juliana Lima',
          date: '07/01/2024',
          score: 8.5,
          department: 'Marketing',
          type: 'received',
        },
        {
          id: '5',
          from: 'Carlos Mendes',
          to: 'Pedro Costa',
          date: '06/01/2024',
          score: 9.3,
          department: 'TI',
          type: 'sent',
        },
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalFeedbacks: 156,
    thisMonth: 24,
    averageScore: 8.7,
    pendingEvaluations: 5,
  }

  const filteredFeedbacks = recentFeedbacks.filter(feedback => {
    const matchesSearch = 
      feedback.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || feedback.type === filterType
    return matchesSearch && matchesType
  })

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">
            Sistema de Feedbacks Internos
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Avalie seus colegas e promova o desenvolvimento contínuo da equipe
          </p>
        </div>
        <Link href="/feedback/internal" className="inline-block">
          <button className="btn-primary flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Avaliar Colegas
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total de Feedbacks</p>
              <p className="text-2xl font-semibold text-neutral-50">{stats.totalFeedbacks}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Este Mês</p>
              <p className="text-2xl font-semibold text-neutral-50">{stats.thisMonth}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Média Geral</p>
              <p className="text-2xl font-semibold text-neutral-50">{stats.averageScore}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Pendentes</p>
              <p className="text-2xl font-semibold text-neutral-50">{stats.pendingEvaluations}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/feedback/internal" className="block">
          <div className="card p-6 hover:bg-neutral-800/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-primary-500/10 text-primary-500">
                <Users className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:text-primary-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-neutral-200">Avaliar Colegas</h3>
            <p className="text-sm text-neutral-400 mt-1">
              Faça avaliações CHA dos seus colegas de trabalho
            </p>
          </div>
        </Link>

        <Link href="/employees" className="block">
          <div className="card p-6 hover:bg-neutral-800/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500">
                <Award className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-neutral-200">Ver Rankings</h3>
            <p className="text-sm text-neutral-400 mt-1">
              Veja os colaboradores com melhores avaliações
            </p>
          </div>
        </Link>

        <Link href="/reports" className="block">
          <div className="card p-6 hover:bg-neutral-800/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500 group-hover:text-green-500 transition-colors" />
            </div>
            <h3 className="font-semibold text-neutral-200">Relatórios</h3>
            <p className="text-sm text-neutral-400 mt-1">
              Análises detalhadas de desempenho
            </p>
          </div>
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500"
                placeholder="Buscar feedbacks..."
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
          >
            <option value="all">Todos os Feedbacks</option>
            <option value="sent">Enviados</option>
            <option value="received">Recebidos</option>
          </select>
        </div>
      </div>

      {/* Recent Feedbacks */}
      <div className="card">
        <div className="p-6 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-200">Feedbacks Recentes</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <div 
                key={feedback.id}
                className="flex items-center justify-between p-4 bg-neutral-900 rounded-lg hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${
                    feedback.type === 'sent' 
                      ? 'bg-blue-500/10 text-blue-500' 
                      : 'bg-green-500/10 text-green-500'
                  }`}>
                    {feedback.type === 'sent' ? (
                      <Activity className="h-5 w-5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-200">
                      {feedback.type === 'sent' ? (
                        <>
                          <span className="text-neutral-400">Você avaliou</span> {feedback.to}
                        </>
                      ) : (
                        <>
                          {feedback.from} <span className="text-neutral-400">avaliou você</span>
                        </>
                      )}
                    </p>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-neutral-500">
                      <span>{feedback.department}</span>
                      <span>•</span>
                      <span>{feedback.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm text-neutral-400">Pontuação</p>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-neutral-200">{feedback.score}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-neutral-500" />
                </div>
              </div>
            ))}
          </div>

          {filteredFeedbacks.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-400">Nenhum feedback encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}