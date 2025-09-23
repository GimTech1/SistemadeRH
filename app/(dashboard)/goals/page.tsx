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
} from 'lucide-react'
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
  const [showNewGoal, setShowNewGoal] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
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
      default: return 'text-neutral-500 bg-neutral-500/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 bg-green-500/10'
      case 'in_progress': return 'text-blue-500 bg-blue-500/10'
      case 'pending': return 'text-yellow-500 bg-yellow-500/10'
      case 'cancelled': return 'text-red-500 bg-red-500/10'
      default: return 'text-neutral-500 bg-neutral-500/10'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-neutral-500'
    }
  }

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         goal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || goal.status === filterStatus
    const matchesCategory = filterCategory === 'all' || goal.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">Metas e PDI</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Plano de Desenvolvimento Individual e metas de performance
          </p>
        </div>
        <button 
          onClick={() => setShowNewGoal(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total de Metas</p>
              <p className="text-2xl font-semibold text-neutral-50">{goals.length}</p>
            </div>
            <Target className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Em Progresso</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {goals.filter(g => g.status === 'in_progress').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Concluídas</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {goals.filter(g => g.status === 'completed').length}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Taxa de Conclusão</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {goals.length > 0 
                  ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
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
                placeholder="Buscar metas..."
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="in_progress">Em Progresso</option>
            <option value="completed">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
          >
            <option value="all">Todas as Categorias</option>
            <option value="performance">Performance</option>
            <option value="skill">Habilidade</option>
            <option value="career">Carreira</option>
            <option value="personal">Pessoal</option>
          </select>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const CategoryIcon = getCategoryIcon(goal.category)
          return (
            <div key={goal.id} className="card hover:bg-neutral-800/50 transition-all">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-200">{goal.title}</h3>
                      <p className="text-sm text-neutral-400 mt-1">{goal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(goal.priority)}`} />
                    <button className="text-neutral-400 hover:text-neutral-200">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-neutral-500">Progresso</span>
                      <span className="text-neutral-300">{goal.progress}%</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          goal.progress === 100 ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center space-x-2 text-neutral-400">
                      <User className="h-4 w-4" />
                      <span>{goal.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-neutral-400">
                      <Calendar className="h-4 w-4" />
                      <span>{goal.deadline}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(goal.status)}`}>
                      {goal.status === 'pending' && 'Pendente'}
                      {goal.status === 'in_progress' && 'Em Progresso'}
                      {goal.status === 'completed' && 'Concluída'}
                      {goal.status === 'cancelled' && 'Cancelada'}
                    </span>
                    <button 
                      onClick={() => setSelectedGoal(goal)}
                      className="text-primary-500 hover:text-primary-400 flex items-center text-sm"
                    >
                      Ver detalhes
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>

                  {/* Key Results */}
                  {goal.keyResults.length > 0 && (
                    <div className="pt-3 border-t border-neutral-800">
                      <p className="text-xs text-neutral-500 mb-2">Resultados-chave:</p>
                      <ul className="space-y-1">
                        {goal.keyResults.slice(0, 2).map((result, index) => (
                          <li key={index} className="text-xs text-neutral-400 flex items-start">
                            <CheckCircle2 className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            {result}
                          </li>
                        ))}
                        {goal.keyResults.length > 2 && (
                          <li className="text-xs text-neutral-500">
                            +{goal.keyResults.length - 2} mais...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredGoals.length === 0 && (
        <div className="card p-12 text-center">
          <Target className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Nenhuma meta encontrada</h3>
          <p className="text-sm text-neutral-500">
            Tente ajustar os filtros ou criar uma nova meta
          </p>
        </div>
      )}
    </div>
  )
}






