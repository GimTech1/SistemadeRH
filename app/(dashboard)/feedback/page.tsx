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
  Plus,
  Eye,
  Edit,
  Grid3X3,
  List,
  Download,
  User,
  Building,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Feedback {
  id: string
  from: string
  to: string
  date: string
  score: number
  department: string
  type: 'sent' | 'received'
  status: 'pending' | 'completed' | 'draft'
  comments: string
  category: 'performance' | 'collaboration' | 'leadership' | 'communication'
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [loading, setLoading] = useState(true)
  const [userStars, setUserStars] = useState({
    available: 3,
    used: 0,
    resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
  })
  const supabase = createClient()

  useEffect(() => {
    loadFeedbacks()
  }, [])

  const loadFeedbacks = async () => {
    try {
      // Simular dados
      setFeedbacks([
        {
          id: '1',
          from: 'João Silva',
          to: 'Maria Santos',
          date: '10/01/2024',
          score: 9.2,
          department: 'Marketing',
          type: 'sent',
          status: 'completed',
          comments: 'Excelente trabalho na campanha de lançamento',
          category: 'performance',
        },
        {
          id: '2',
          from: 'Pedro Costa',
          to: 'João Silva',
          date: '09/01/2024',
          score: 8.8,
          department: 'TI',
          type: 'received',
          status: 'completed',
          comments: 'Ótima liderança técnica e comunicação clara',
          category: 'leadership',
        },
        {
          id: '3',
          from: 'Ana Oliveira',
          to: 'Carlos Mendes',
          date: '08/01/2024',
          score: 9.0,
          department: 'Vendas',
          type: 'sent',
          status: 'completed',
          comments: 'Demonstrou grande proatividade e resultados excepcionais',
          category: 'performance',
        },
        {
          id: '4',
          from: 'Maria Santos',
          to: 'Juliana Lima',
          date: '07/01/2024',
          score: 8.5,
          department: 'Marketing',
          type: 'received',
          status: 'completed',
          comments: 'Colaboração exemplar em projetos cross-funcionais',
          category: 'collaboration',
        },
        {
          id: '5',
          from: 'Carlos Mendes',
          to: 'Pedro Costa',
          date: '06/01/2024',
          score: 9.3,
          department: 'TI',
          type: 'sent',
          status: 'completed',
          comments: 'Excelente comunicação técnica e mentoria da equipe',
          category: 'communication',
        },
        {
          id: '6',
          from: 'Lucas Martins',
          to: 'Fernanda Silva',
          date: '05/01/2024',
          score: 8.7,
          department: 'RH',
          type: 'received',
          status: 'pending',
          comments: 'Aguardando feedback sobre gestão de pessoas',
          category: 'leadership',
        },
        {
          id: '7',
          from: 'Roberto Lima',
          to: 'Ana Costa',
          date: '04/01/2024',
          score: 0,
          department: 'Financeiro',
          type: 'sent',
          status: 'draft',
          comments: 'Rascunho de feedback sobre análise financeira',
          category: 'performance',
        },
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return TrendingUp
      case 'collaboration': return Users
      case 'leadership': return Award
      case 'communication': return MessageSquare
      default: return Star
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'text-blue-500 bg-blue-500/10'
      case 'collaboration': return 'text-green-500 bg-green-500/10'
      case 'leadership': return 'text-purple-500 bg-purple-500/10'
      case 'communication': return 'text-orange-500 bg-orange-500/10'
      default: return 'text-oxford-blue-500 bg-oxford-blue-500/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-700 bg-emerald-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'draft': return 'text-oxford-blue-700 bg-oxford-blue-100'
      default: return 'text-oxford-blue-700 bg-oxford-blue-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'pending': return 'Pendente'
      case 'draft': return 'Rascunho'
      default: return status
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'performance': return 'Performance'
      case 'collaboration': return 'Colaboração'
      case 'leadership': return 'Liderança'
      case 'communication': return 'Comunicação'
      default: return category
    }
  }

  const filteredFeedbacks = feedbacks
    .filter(feedback => {
      const matchesSearch = 
        feedback.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feedback.comments.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || feedback.type === filterType
      const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus
      return matchesSearch && matchesType && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime()
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'department') return a.department.localeCompare(b.department)
      return 0
    })

  const stats = {
    totalFeedbacks: feedbacks.length,
    thisMonth: feedbacks.filter(f => f.date.includes('01/2024')).length,
    averageScore: feedbacks.filter(f => f.score > 0).reduce((acc, f) => acc + f.score, 0) / feedbacks.filter(f => f.score > 0).length || 0,
    pendingEvaluations: feedbacks.filter(f => f.status === 'pending').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando feedbacks...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Veja os feedbacks recebidos e enviados</h1>
        </div>
      </div>

      {/* Sistema de Estrelas */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-sm border border-yellow-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-roboto font-medium text-rich-black-900">Sistema de Agradecimentos</h2>
              <p className="text-sm font-roboto font-light text-oxford-blue-600">Você tem 3 estrelas por mês para agradecer colegas</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-roboto font-semibold text-rich-black-900">
              {userStars.available - userStars.used}/{userStars.available}
            </div>
            <div className="text-sm font-roboto font-light text-oxford-blue-600">estrelas disponíveis</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {[...Array(userStars.available)].map((_, i) => (
              <Star
                key={i}
                className={`h-8 w-8 ${
                  i < (userStars.available - userStars.used)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <Link href="/feedback/internal">
            <button 
              disabled={userStars.available - userStars.used === 0}
              className={`px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 flex items-center gap-2 ${
                userStars.available - userStars.used > 0
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Star className="h-4 w-4" />
              Dar Estrela
            </button>
          </Link>
        </div>
        
        <div className="mt-4 text-xs font-roboto font-light text-oxford-blue-500">
          Próximo reset: {userStars.resetDate.toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Feedbacks</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.totalFeedbacks}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">avaliações realizadas</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Este Mês</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.thisMonth}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">feedbacks enviados</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Média Geral</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.averageScore.toFixed(1)}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">pontuação média</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Pendentes</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{stats.pendingEvaluations}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">aguardando resposta</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/feedback/internal" className="block">
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-yinmn-blue-100 text-yinmn-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-oxford-blue-400 group-hover:text-yinmn-blue-600 transition-colors" />
            </div>
            <h3 className="font-roboto font-medium text-rich-black-900 mb-2">Avaliar Colegas</h3>
            <p className="text-sm font-roboto font-light text-oxford-blue-600">
              Faça avaliações CHA dos seus colegas de trabalho
            </p>
          </div>
        </Link>

        <Link href="/employees" className="block">
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <Award className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-oxford-blue-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="font-roboto font-medium text-rich-black-900 mb-2">Ver Rankings</h3>
            <p className="text-sm font-roboto font-light text-oxford-blue-600">
              Veja os colaboradores com melhores avaliações
            </p>
          </div>
        </Link>

        <Link href="/reports" className="block">
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <TrendingUp className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-oxford-blue-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="font-roboto font-medium text-rich-black-900 mb-2">Relatórios</h3>
            <p className="text-sm font-roboto font-light text-oxford-blue-600">
              Análises detalhadas de desempenho
            </p>
          </div>
        </Link>
      </div>

      {/* Filtros e busca */}
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
        <div className="flex flex-col gap-4">
          {/* Barra de busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                placeholder="Buscar feedbacks por pessoa, departamento ou comentário..."
              />
            </div>
          </div>
          
          {/* Controles */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Tipo:</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Tipos</option>
                <option value="sent">Enviados</option>
                <option value="received">Recebidos</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Status:</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="completed">Concluído</option>
                <option value="pending">Pendente</option>
                <option value="draft">Rascunho</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Ordenar:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="date">Data</option>
                <option value="score">Pontuação</option>
                <option value="department">Departamento</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Visualizar:</label>
              <div className="flex bg-platinum-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'table' 
                      ? 'bg-white text-yinmn-blue-600 shadow-sm' 
                      : 'text-oxford-blue-600 hover:text-yinmn-blue-600'
                  }`}
                  title="Visualização em tabela"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewMode === 'cards' 
                      ? 'bg-white text-yinmn-blue-600 shadow-sm' 
                      : 'text-oxford-blue-600 hover:text-yinmn-blue-600'
                  }`}
                  title="Visualização em cards"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="bg-platinum-100 hover:bg-platinum-200 text-oxford-blue-600 px-4 py-2 rounded-lg font-roboto font-medium transition-all duration-200 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Visualização de feedbacks */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-platinum-50 border-b border-platinum-200">
                <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Feedback</th>
                  <th className="px-6 py-4">Departamento</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Pontuação</th>
                  <th className="px-6 py-4 text-center">Data</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-200">
                {filteredFeedbacks.map((feedback) => (
                  <tr key={feedback.id} className="hover:bg-platinum-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${getCategoryColor(feedback.category)}`}>
                          {(() => {
                            const Icon = getCategoryIcon(feedback.category)
                            return <Icon className="h-4 w-4" />
                          })()}
                        </div>
                        <div className="ml-3">
                          <p className="font-roboto font-medium text-rich-black-900">
                            {feedback.type === 'sent' ? (
                              <>Você avaliou <span className="text-oxford-blue-600">{feedback.to}</span></>
                            ) : (
                              <><span className="text-oxford-blue-600">{feedback.from}</span> avaliou você</>
                            )}
                          </p>
                          <p className="text-sm font-roboto font-light text-oxford-blue-600">{feedback.comments}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                        {feedback.department}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                        {getCategoryText(feedback.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium ${getStatusColor(feedback.status)}`}>
                        {getStatusText(feedback.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {feedback.score > 0 ? (
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-roboto font-semibold text-rich-black-900">{feedback.score}</span>
                        </div>
                      ) : (
                        <span className="text-oxford-blue-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-roboto font-medium text-rich-black-900">{feedback.date}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeedbacks.map((feedback) => {
            const CategoryIcon = getCategoryIcon(feedback.category)
            return (
              <div key={feedback.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200">
                {/* Header do card */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${getCategoryColor(feedback.category)}`}>
                      <CategoryIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-roboto font-medium text-rich-black-900 text-lg mb-1">
                        {feedback.type === 'sent' ? (
                          <>Você avaliou <span className="text-oxford-blue-600">{feedback.to}</span></>
                        ) : (
                          <><span className="text-oxford-blue-600">{feedback.from}</span> avaliou você</>
                        )}
                      </h3>
                      <p className="text-sm font-roboto font-light text-oxford-blue-600">{feedback.comments}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium ${getStatusColor(feedback.status)}`}>
                      {getStatusText(feedback.status)}
                    </span>
                  </div>
                </div>

                {/* Informações do feedback */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-oxford-blue-400" />
                    <span className="text-sm font-roboto font-light text-oxford-blue-600">{feedback.department}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-oxford-blue-400" />
                    <span className="text-sm font-roboto font-light text-oxford-blue-600">{feedback.date}</span>
                  </div>

                  {/* Pontuação */}
                  {feedback.score > 0 && (
                    <div className="bg-platinum-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-roboto font-medium text-oxford-blue-500">Pontuação</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-lg font-roboto font-semibold text-rich-black-900">{feedback.score}</span>
                        </div>
                      </div>
                      <div className="w-full bg-platinum-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-yinmn-blue-500 to-yinmn-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(feedback.score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Categoria */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                      {getCategoryText(feedback.category)}
                    </span>
                    {feedback.type === 'sent' ? (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Activity className="h-4 w-4" />
                        <span className="text-xs font-roboto font-medium">Enviado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-roboto font-medium">Recebido</span>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center justify-between pt-4 border-t border-platinum-200">
                    <div className="flex gap-2">
                      <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                    <button className="text-sm font-roboto font-medium text-yinmn-blue-600 hover:text-yinmn-blue-700 flex items-center gap-1">
                      Ver detalhes
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {filteredFeedbacks.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-16 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <MessageSquare className="h-10 w-10 text-oxford-blue-400" />
          </div>
          <h3 className="text-xl font-roboto font-light text-rich-black-900 mb-4 tracking-wide">Nenhum feedback encontrado</h3>
          <p className="text-sm text-oxford-blue-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
            Tente ajustar sua busca ou comece a avaliar seus colegas para promover o desenvolvimento da equipe
          </p>
          <Link href="/feedback/internal">
            <button className="bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto mt-8">
              <Users className="h-4 w-4" />
              Começar Avaliações
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}