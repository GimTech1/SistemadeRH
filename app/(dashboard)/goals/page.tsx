'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Target,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2,
  MoreVertical,
  User,
  ChevronRight,
  Award,
  Zap,
  Eye,
  Grid3X3,
  List,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Goal {
  id: string
  title: string
  description: string
  category: 'performance' | 'skill' | 'career' | 'personal'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  progress: number
  startDate: string
  deadline: string
  assignedTo: string
  assignedBy: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  keyResults: string[]
  comments: Comment[]
}

interface Comment {
  id: string
  author: string
  date: string
  text: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('deadline')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      // Simular dados
      setGoals([
        {
          id: '1',
          title: 'Aumentar vendas em 20%',
          description: 'Alcançar um aumento de 20% nas vendas comparado ao trimestre anterior',
          category: 'performance',
          status: 'in_progress',
          progress: 65,
          startDate: '01/01/2024',
          deadline: '31/03/2024',
          assignedTo: 'João Silva',
          assignedBy: 'Maria Santos',
          priority: 'high',
          keyResults: [
            'Prospectar 50 novos clientes',
            'Fechar 15 novos contratos',
            'Aumentar ticket médio em 10%',
          ],
          comments: [
            { id: '1', author: 'Maria Santos', date: '10/01/2024', text: 'Excelente progresso!' },
          ],
        },
        {
          id: '2',
          title: 'Certificação em Gestão de Projetos',
          description: 'Obter certificação PMP até o final do semestre',
          category: 'skill',
          status: 'in_progress',
          progress: 40,
          startDate: '01/02/2024',
          deadline: '30/06/2024',
          assignedTo: 'Pedro Costa',
          assignedBy: 'Ana Oliveira',
          priority: 'medium',
          keyResults: [
            'Completar curso preparatório',
            'Realizar simulados com 80%+ de acerto',
            'Agendar e passar no exame',
          ],
          comments: [],
        },
        {
          id: '3',
          title: 'Desenvolver liderança de equipe',
          description: 'Assumir responsabilidades de liderança e mentoria',
          category: 'career',
          status: 'pending',
          progress: 0,
          startDate: '15/02/2024',
          deadline: '31/12/2024',
          assignedTo: 'Carlos Mendes',
          assignedBy: 'João Silva',
          priority: 'low',
          keyResults: [
            'Mentorar 2 júniores',
            'Liderar projeto cross-funcional',
            'Completar treinamento de liderança',
          ],
          comments: [],
        },
        {
          id: '4',
          title: 'Melhorar satisfação do cliente',
          description: 'Aumentar NPS de 7.5 para 9.0',
          category: 'performance',
          status: 'completed',
          progress: 100,
          startDate: '01/10/2023',
          deadline: '31/12/2023',
          assignedTo: 'Juliana Lima',
          assignedBy: 'Maria Santos',
          priority: 'critical',
          keyResults: [
            'Implementar novo processo de atendimento',
            'Reduzir tempo de resposta em 50%',
            'Treinar equipe em experiência do cliente',
          ],
          comments: [
            { id: '2', author: 'Maria Santos', date: '20/12/2023', text: 'Meta superada! Parabéns!' },
          ],
        },
        {
          id: '5',
          title: 'Dominar React e Next.js',
          description: 'Aprofundar conhecimentos em tecnologias front-end modernas',
          category: 'skill',
          status: 'in_progress',
          progress: 75,
          startDate: '01/01/2024',
          deadline: '30/04/2024',
          assignedTo: 'Lucas Martins',
          assignedBy: 'Pedro Costa',
          priority: 'medium',
          keyResults: [
            'Completar curso avançado de React',
            'Desenvolver 3 projetos práticos',
            'Contribuir para projeto open source',
          ],
          comments: [],
        },
        {
          id: '6',
          title: 'Equilíbrio vida-trabalho',
          description: 'Implementar práticas de bem-estar e produtividade',
          category: 'personal',
          status: 'in_progress',
          progress: 30,
          startDate: '01/03/2024',
          deadline: '31/12/2024',
          assignedTo: 'Fernanda Silva',
          assignedBy: 'Ana Oliveira',
          priority: 'low',
          keyResults: [
            'Estabelecer rotina de exercícios',
            'Implementar técnicas de mindfulness',
            'Reduzir horas extras em 20%',
          ],
          comments: [],
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
      case 'skill': return Award
      case 'career': return Zap
      case 'personal': return User
      default: return Target
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'text-blue-500 bg-blue-500/10'
      case 'skill': return 'text-purple-500 bg-purple-500/10'
      case 'career': return 'text-green-500 bg-green-500/10'
      case 'personal': return 'text-yellow-500 bg-yellow-500/10'
      default: return 'text-oxford-blue-500 bg-oxford-blue-500/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-emerald-700 bg-emerald-100'
      case 'in_progress': return 'text-blue-700 bg-blue-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'cancelled': return 'text-red-700 bg-red-100'
      default: return 'text-oxford-blue-700 bg-oxford-blue-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-oxford-blue-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'in_progress': return 'Em Progresso'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'performance': return 'Performance'
      case 'skill': return 'Habilidade'
      case 'career': return 'Carreira'
      case 'personal': return 'Pessoal'
      default: return category
    }
  }

  const filteredGoals = goals
    .filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           goal.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || goal.status === filterStatus
      const matchesCategory = filterCategory === 'all' || goal.category === filterCategory
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline.split('/').reverse().join('-')).getTime() - new Date(b.deadline.split('/').reverse().join('-')).getTime()
      if (sortBy === 'progress') return b.progress - a.progress
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return 0
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando metas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Plano de Desenvolvimento Individual e metas de performance </h1>
        </div>
        <button className="bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Meta
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Metas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{goals.length}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">metas ativas</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Em Progresso</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {goals.filter(g => g.status === 'in_progress').length}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">em andamento</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Concluídas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {goals.filter(g => g.status === 'completed').length}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">finalizadas</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Taxa de Conclusão</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {goals.length > 0 
                  ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
                  : 0}%
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">sucesso geral</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#778DA9]" />
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
                placeholder="Buscar metas por título, descrição ou responsável..."
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
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Progresso</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Categoria:</label>
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                <option value="performance">Performance</option>
                <option value="skill">Habilidade</option>
                <option value="career">Carreira</option>
                <option value="personal">Pessoal</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Ordenar:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="deadline">Prazo</option>
                <option value="progress">Progresso</option>
                <option value="priority">Prioridade</option>
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

      {/* Visualização de metas */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-platinum-50 border-b border-platinum-200">
                <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Meta</th>
                  <th className="px-6 py-4">Responsável</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Progresso</th>
                  <th className="px-6 py-4 text-center">Prazo</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-200">
                {filteredGoals.map((goal) => (
                  <tr key={goal.id} className="hover:bg-platinum-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                          {(() => {
                            const Icon = getCategoryIcon(goal.category)
                            return <Icon className="h-4 w-4" />
                          })()}
                        </div>
                        <div className="ml-3">
                          <p className="font-roboto font-medium text-rich-black-900">{goal.title}</p>
                          <p className="text-sm font-roboto font-light text-oxford-blue-600">{goal.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-roboto font-medium text-rich-black-900">{goal.assignedTo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                        {getCategoryText(goal.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium ${getStatusColor(goal.status)}`}>
                        {getStatusText(goal.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-roboto font-semibold text-rich-black-900">{goal.progress}%</span>
                        <div className="w-16 h-2 bg-platinum-200 rounded-full mt-1">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              goal.progress === 100 ? 'bg-emerald-500' : 'bg-yinmn-blue-500'
                            }`}
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-roboto font-medium text-rich-black-900">{goal.deadline}</span>
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
          {filteredGoals.map((goal) => {
            const CategoryIcon = getCategoryIcon(goal.category)
            return (
              <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200">
                {/* Header do card */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${getCategoryColor(goal.category)}`}>
                      <CategoryIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-roboto font-medium text-rich-black-900 text-lg mb-1">{goal.title}</h3>
                      <p className="text-sm font-roboto font-light text-oxford-blue-600">{goal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`} />
                    <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Informações da meta */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-oxford-blue-400" />
                    <span className="text-sm font-roboto font-light text-oxford-blue-600">{goal.assignedTo}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-oxford-blue-400" />
                    <span className="text-sm font-roboto font-light text-oxford-blue-600">Prazo: {goal.deadline}</span>
                  </div>

                  {/* Progresso */}
                  <div className="bg-platinum-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-roboto font-medium text-oxford-blue-500">Progresso</span>
                      <span className="text-lg font-roboto font-semibold text-rich-black-900">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-platinum-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          goal.progress === 100 ? 'bg-emerald-500' : 'bg-yinmn-blue-500'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status e Categoria */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium ${getStatusColor(goal.status)}`}>
                      {getStatusText(goal.status)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                      {getCategoryText(goal.category)}
                    </span>
                  </div>

                  {/* Key Results */}
                  {goal.keyResults.length > 0 && (
                    <div className="border-t border-platinum-200 pt-4">
                      <p className="text-xs text-oxford-blue-500 font-roboto font-medium uppercase tracking-wider mb-3">Resultados-chave</p>
                      <ul className="space-y-2">
                        {goal.keyResults.slice(0, 2).map((result, index) => (
                          <li key={index} className="text-sm font-roboto font-light text-oxford-blue-600 flex items-start">
                            <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-emerald-500" />
                            {result}
                          </li>
                        ))}
                        {goal.keyResults.length > 2 && (
                          <li className="text-xs font-roboto font-light text-oxford-blue-500">
                            +{goal.keyResults.length - 2} mais...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

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
      {filteredGoals.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-16 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Target className="h-10 w-10 text-oxford-blue-400" />
          </div>
          <h3 className="text-xl font-roboto font-light text-rich-black-900 mb-4 tracking-wide">Nenhuma meta encontrada</h3>
          <p className="text-sm text-oxford-blue-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
            Tente ajustar sua busca ou crie uma nova meta para começar a acompanhar o desenvolvimento dos colaboradores
          </p>
          <button className="bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto mt-8">
            <Plus className="h-4 w-4" />
            Criar Primeira Meta
          </button>
        </div>
      )}
    </div>
  )
}