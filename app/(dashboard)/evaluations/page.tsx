'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Star,
  Brain,
  Zap,
  Heart,
  Calendar,
  User,
  Award,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  FileText,
  Grid3X3,
  List,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Evaluation {
  id: string
  employee_name: string
  evaluator_name: string
  cycle_name: string
  status: 'draft' | 'in_progress' | 'completed' | 'reviewed'
  overall_score: number
  created_at: string
  submitted_at: string
  cha_scores: {
    conhecimento: number
    habilidade: number
    atitude: number
  }
}

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const supabase = createClient()

  useEffect(() => {
    loadEvaluations()
  }, [])

  const loadEvaluations = async () => {
    try {
      // Simular dados de avaliações
      setEvaluations([
        {
          id: '1',
          employee_name: 'João Silva',
          evaluator_name: 'Maria Santos',
          cycle_name: 'Q1 2024',
          status: 'completed',
          overall_score: 8.5,
          created_at: '2024-01-10',
          submitted_at: '2024-01-15',
          cha_scores: {
            conhecimento: 8.0,
            habilidade: 9.0,
            atitude: 8.5,
          },
        },
        {
          id: '2',
          employee_name: 'Ana Costa',
          evaluator_name: 'Pedro Oliveira',
          cycle_name: 'Q1 2024',
          status: 'in_progress',
          overall_score: 0,
          created_at: '2024-01-12',
          submitted_at: '',
          cha_scores: {
            conhecimento: 7.5,
            habilidade: 8.0,
            atitude: 0,
          },
        },
        {
          id: '3',
          employee_name: 'Carlos Mendes',
          evaluator_name: 'Maria Santos',
          cycle_name: 'Q4 2023',
          status: 'reviewed',
          overall_score: 9.2,
          created_at: '2023-10-05',
          submitted_at: '2023-10-20',
          cha_scores: {
            conhecimento: 9.0,
            habilidade: 9.5,
            atitude: 9.0,
          },
        },
        {
          id: '4',
          employee_name: 'Fernanda Lima',
          evaluator_name: 'Roberto Costa',
          cycle_name: 'Q1 2024',
          status: 'draft',
          overall_score: 0,
          created_at: '2024-01-08',
          submitted_at: '',
          cha_scores: {
            conhecimento: 0,
            habilidade: 0,
            atitude: 0,
          },
        },
        {
          id: '5',
          employee_name: 'Lucas Martins',
          evaluator_name: 'Ana Oliveira',
          cycle_name: 'Q1 2024',
          status: 'completed',
          overall_score: 7.8,
          created_at: '2024-01-05',
          submitted_at: '2024-01-12',
          cha_scores: {
            conhecimento: 7.5,
            habilidade: 8.0,
            atitude: 8.0,
          },
        },
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-platinum-100 text-oxford-blue-600'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'completed':
        return 'bg-emerald-100 text-emerald-700'
      case 'reviewed':
        return 'bg-yinmn-blue-100 text-yinmn-blue-700'
      default:
        return 'bg-platinum-100 text-oxford-blue-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho'
      case 'in_progress':
        return 'Em Andamento'
      case 'completed':
        return 'Concluída'
      case 'reviewed':
        return 'Revisada'
      default:
        return status
    }
  }

  const getCHAIcon = (category: string) => {
    switch (category) {
      case 'conhecimento':
        return Brain
      case 'habilidade':
        return Zap
      case 'atitude':
        return Heart
      default:
        return Star
    }
  }

  const getCHAColor = (category: string) => {
    switch (category) {
      case 'conhecimento':
        return 'text-purple-500'
      case 'habilidade':
        return 'text-blue-500'
      case 'atitude':
        return 'text-pink-500'
      default:
        return 'text-oxford-blue-400'
    }
  }

  const filteredEvaluations = evaluations
    .filter(evaluation => {
      const matchesSearch = evaluation.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           evaluation.evaluator_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || evaluation.status === filterStatus
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'created_at') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'score') return b.overall_score - a.overall_score
      if (sortBy === 'employee') return a.employee_name.localeCompare(b.employee_name)
      return 0
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando avaliações...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Gerencie e acompanhe as avaliações de desempenho dos colaboradores</h1>
        </div>
        <Link href="/evaluations/new">
          <button className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" style={{ backgroundColor: '#1B263B' }}>
            <Plus className="h-4 w-4" />
            Nova Avaliação
          </button>
        </Link>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Avaliações</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{evaluations.length}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">avaliações ativas</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Concluídas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {evaluations.filter(e => e.status === 'completed' || e.status === 'reviewed').length}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">avaliações finalizadas</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Em Andamento</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {evaluations.filter(e => e.status === 'in_progress').length}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">em progresso</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Média Geral</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {(evaluations.filter(e => e.overall_score > 0).reduce((acc, e) => acc + e.overall_score, 0) / evaluations.filter(e => e.overall_score > 0).length || 0).toFixed(1)}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">pontuação média</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>
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
                placeholder="Buscar por colaborador ou avaliador..."
              />
            </div>
          </div>
          
          {/* Controles */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Status:</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="draft">Rascunho</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
                <option value="reviewed">Revisada</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Ordenar:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="created_at">Data de Criação</option>
                <option value="score">Pontuação</option>
                <option value="employee">Colaborador</option>
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

      {/* Visualização de avaliações */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-platinum-50 border-b border-platinum-200">
                <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Colaborador</th>
                  <th className="px-6 py-4">Avaliador</th>
                  <th className="px-6 py-4">Ciclo</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Pontuação</th>
                  <th className="px-6 py-4 text-center">CHA</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-200">
                {filteredEvaluations.map((evaluation) => (
                  <tr key={evaluation.id} className="hover:bg-platinum-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                          {evaluation.employee_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="ml-3">
                          <p className="font-roboto font-medium text-rich-black-900">{evaluation.employee_name}</p>
                          <p className="text-sm font-roboto font-light text-oxford-blue-600">{evaluation.evaluator_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-roboto font-medium text-rich-black-900">{evaluation.evaluator_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                        {evaluation.cycle_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium ${getStatusColor(evaluation.status)}`}>
                        {getStatusText(evaluation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {evaluation.overall_score > 0 ? (
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-roboto font-semibold text-rich-black-900">{evaluation.overall_score.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-oxford-blue-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {Object.entries(evaluation.cha_scores).map(([category, score]) => {
                          const Icon = getCHAIcon(category)
                          const color = getCHAColor(category)
                          return (
                            <div key={category} className="flex items-center gap-1">
                              <Icon className={`h-3 w-3 ${color}`} />
                              <span className="text-xs font-roboto font-medium text-rich-black-900">
                                {score > 0 ? score.toFixed(1) : '—'}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/evaluations/${evaluation.id}`}>
                          <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <Link href={`/evaluations/${evaluation.id}/edit`}>
                          <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                            <Edit className="h-4 w-4" />
                          </button>
                        </Link>
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
          {filteredEvaluations.map((evaluation) => (
            <div key={evaluation.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200">
              {/* Header do card */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                    {evaluation.employee_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-roboto font-medium text-rich-black-900 text-lg">{evaluation.employee_name}</h3>
                    <p className="text-sm font-roboto font-light text-oxford-blue-600">{evaluation.evaluator_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium ${getStatusColor(evaluation.status)}`}>
                    {getStatusText(evaluation.status)}
                  </span>
                </div>
              </div>

              {/* Informações da avaliação */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-oxford-blue-400" />
                  <span className="text-sm font-roboto font-light text-oxford-blue-600">{evaluation.cycle_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-oxford-blue-400" />
                  <span className="text-sm font-roboto font-light text-oxford-blue-600">Criada em {new Date(evaluation.created_at).toLocaleDateString('pt-BR')}</span>
                </div>

                {/* Pontuação CHA */}
                <div className="bg-platinum-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-roboto font-medium text-oxford-blue-500">Avaliação CHA</span>
                    {evaluation.overall_score > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-roboto font-semibold text-rich-black-900">{evaluation.overall_score.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(evaluation.cha_scores).map(([category, score]) => {
                      const Icon = getCHAIcon(category)
                      const color = getCHAColor(category)
                      return (
                        <div key={category} className="text-center">
                          <Icon className={`h-5 w-5 ${color} mx-auto mb-1`} />
                          <p className="text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">{category.charAt(0)}</p>
                          <p className="text-lg font-roboto font-semibold text-rich-black-900">
                            {score > 0 ? score.toFixed(1) : '—'}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-4 border-t border-platinum-200">
                  <div className="flex gap-2">
                    <Link href={`/evaluations/${evaluation.id}`}>
                      <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link href={`/evaluations/${evaluation.id}/edit`}>
                      <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                  {evaluation.submitted_at && (
                    <span className="text-xs font-roboto font-light text-oxford-blue-500">
                      Enviada em {new Date(evaluation.submitted_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredEvaluations.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-16 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <FileText className="h-10 w-10 text-oxford-blue-400" />
          </div>
          <h3 className="text-xl font-roboto font-light text-rich-black-900 mb-4 tracking-wide">Nenhuma avaliação encontrada</h3>
          <p className="text-sm text-oxford-blue-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
            Tente ajustar sua busca ou crie uma nova avaliação para começar a acompanhar o desempenho dos colaboradores
          </p>
          <Link href="/evaluations/new">
            <button className="bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto mt-8">
              <Plus className="h-4 w-4" />
              Criar Primeira Avaliação
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}