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
  X,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Goal {
  id: string
  title: string
  description: string
  category: 'performance' | 'skill' | 'career' | 'personal'
  status: 'in_progress' | 'hit' | 'missed'
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
  const [showNewGoalModal, setShowNewGoalModal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'performance' as 'performance' | 'skill' | 'career' | 'personal',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    deadline: '',
    assignedTo: '',
  })
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [departmentId, setDepartmentId] = useState('')
  const [employees, setEmployees] = useState<{ id: string; name: string; department?: string | null }[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [detailsGoal, setDetailsGoal] = useState<Goal | null>(null)
  const [editGoal, setEditGoal] = useState<Goal | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    deadline: '',
    progress: 0,
    isCompleted: false,
  })
  useEffect(() => {
    if (showNewGoalModal) {
      document.body.classList.add('overflow-hidden')
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setShowNewGoalModal(false)
      }
      document.addEventListener('keydown', onKey)
      return () => {
        document.body.classList.remove('overflow-hidden')
        document.removeEventListener('keydown', onKey)
      }
    } else {
      document.body.classList.remove('overflow-hidden')
    }
    return () => document.body.classList.remove('overflow-hidden')
  }, [showNewGoalModal])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (detailsGoal) setDetailsGoal(null)
        if (editGoal) setEditGoal(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [detailsGoal, editGoal])

  useEffect(() => {
    loadGoals()
  }, [])

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true)
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
          .order('name', { ascending: true })
        if (error) throw error
        setDepartments((data || []).map((d: any) => ({ id: d.id, name: d.name })))
      } catch (e) {
      } finally {
        setLoadingDepartments(false)
      }
    }
    loadDepartments()
  }, [supabase])

  useEffect(() => {
    const loadEmployeesByDepartment = async () => {
      if (!departmentId) {
        setEmployees([])
        setSelectedEmployeeId('')
        return
      }
      try {
        setLoadingEmployees(true)
        const { data, error } = await supabase
          .from('employees')
          .select('id, full_name, department')
          .eq('department', departmentId)
          .order('full_name', { ascending: true })
        if (error) throw error
        setEmployees((data || []).map((e: any) => ({ id: e.id, name: e.full_name || 'Sem nome', department: e.department })))
      } catch (e) {
      } finally {
        setLoadingEmployees(false)
      }
    }
    loadEmployeesByDepartment()
  }, [departmentId, supabase])

  const loadGoals = async () => {
    try {
      setLoading(true)
      const { data, error } = await (supabase as any)
        .from('goals')
        .select(`
          id, title, description, target_date, progress, is_completed, created_at,
          employee_id,
          employees:employee_id ( full_name )
        `)
        .order('created_at', { ascending: false })
      if (error) throw error

      const mapped: Goal[] = (data || []).map((g: any) => {
        const status: 'in_progress' | 'hit' | 'missed' = g.is_completed
          ? 'hit'
          : (Number(g.progress || 0) >= 100 ? 'hit' : 'in_progress')
        return {
        id: g.id,
        title: g.title || '',
        description: g.description || '',
        category: 'performance',
        status,
        progress: Number(g.progress || 0),
        startDate: g.created_at ? new Date(g.created_at).toLocaleDateString('pt-BR') : '',
        deadline: g.target_date ? new Date(g.target_date).toLocaleDateString('pt-BR') : '',
        assignedTo: g.employees?.full_name || '—',
        assignedBy: '',
        priority: 'medium',
        keyResults: [],
        comments: [],
        }
      })
      setGoals(mapped)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const markAsHit = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('goals')
        .update({ is_completed: true, progress: 100 } as any)
        .eq('id', id)
      if (error) throw error
      setGoals(prev => prev.map(g => g.id === id ? { ...g, status: 'hit', progress: 100 } : g))
      toast.success('Meta marcada como batida')
    } catch (e) {
      toast.error('Não foi possível atualizar a meta')
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from('goals')
        .delete()
        .eq('id', id)
      if (error) throw error
      setGoals(prev => prev.filter(g => g.id !== id))
      toast.success('Meta excluída')
    } catch (e) {
      toast.error('Não foi possível excluir a meta')
    }
  }

  useEffect(() => {
    if (editGoal) {
      setEditForm({
        title: editGoal.title,
        description: editGoal.description,
        deadline: (() => {
          const p = editGoal.deadline.split('/')
          if (p.length === 3) return `${p[2]}-${p[1].padStart(2,'0')}-${p[0].padStart(2,'0')}`
          return ''
        })(),
        progress: editGoal.progress || 0,
        isCompleted: editGoal.status === 'hit',
      })
    }
  }, [editGoal])

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
      case 'hit': return 'text-emerald-700 bg-emerald-100'
      case 'missed': return 'text-red-700 bg-red-100'
      case 'in_progress': return 'text-blue-700 bg-blue-100'
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
      case 'in_progress': return 'Em Progresso'
      case 'hit': return 'Batida'
      case 'missed': return 'Não Batida'
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Plano de Desenvolvimento Individual e metas de performance </h1>
        </div>
        <button onClick={() => setShowNewGoalModal(true)} className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center gap-2 w-fit" style={{ backgroundColor: '#1B263B' }}>
          <Plus className="h-4 w-4" />
          Nova Meta
        </button>
      </div>

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
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Batidas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {goals.filter(g => g.status === 'hit').length}
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
                  ? Math.round((goals.filter(g => g.status === 'hit').length / goals.length) * 100)
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

      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
        <div className="flex flex-col gap-4">
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
                  
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Status:</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="in_progress">Em Progresso</option>
                <option value="hit">Batida</option>
                <option value="missed">Não Batida</option>
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

      {/* Abas rápidas */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'in_progress', label: 'Em Progresso' },
          { key: 'hit', label: 'Batidas' },
          { key: 'missed', label: 'Não Batidas' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setFilterStatus(t.key as any)}
            className={`px-4 py-2 rounded-xl text-sm border ${filterStatus === t.key ? 'bg-yinmn-blue-600 text-white border-yinmn-blue-600' : 'bg-white text-rich-black-900 border-platinum-300 hover:bg-platinum-100'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

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
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(goal.priority)}`} />
                      <button onClick={() => setOpenMenuId(openMenuId === goal.id ? null : goal.id)} className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                    {openMenuId === goal.id && (
                      <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-platinum-200 py-2 z-10">
                        <button onClick={() => { setEditGoal(goal); setOpenMenuId(null) }} className="w-full text-left px-4 py-2 text-sm hover:bg-platinum-100">Editar</button>
                        <button onClick={() => { markAsHit(goal.id); setOpenMenuId(null) }} className="w-full text-left px-4 py-2 text-sm hover:bg-platinum-100">Marcar como batida</button>
                        <button onClick={() => { deleteGoal(goal.id); setOpenMenuId(null) }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Excluir</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-oxford-blue-400" />
                    <span className="text-sm font-roboto font-light text-oxford-blue-600">{goal.assignedTo}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-oxford-blue-400" />
                    <span className="text-sm font-roboto font-light text-oxford-blue-600">Prazo: {goal.deadline}</span>
                  </div>

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

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium ${getStatusColor(goal.status)}`}>
                      {getStatusText(goal.status)}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                      {getCategoryText(goal.category)}
                    </span>
                  </div>

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

                  <div className="flex items-center justify-between pt-4 border-t border-platinum-200">
                    <div className="flex gap-2">
                      <button onClick={() => setDetailsGoal(goal)} className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditGoal(goal)} className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editGoal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditGoal(null)}>
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-platinum-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-platinum-200">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Editar Meta</h3>
              <button className="p-2 rounded-lg hover:bg-platinum-100" onClick={() => setEditGoal(null)}>
                <X className="w-4 h-4 text-oxford-blue-600" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!editGoal) return
                if (!editForm.title || !editForm.deadline) {
                  toast.error('Preencha título e prazo')
                  return
                }
                try {
                  const { error } = await (supabase as any)
                    .from('goals')
                    .update({
                      title: editForm.title,
                      description: editForm.description,
                      target_date: editForm.deadline,
                      progress: editForm.progress,
                      is_completed: editForm.isCompleted,
                    } as any)
                    .eq('id', (editGoal as any).id)
                  if (error) throw error

                  setGoals(prev => prev.map(g => g.id === (editGoal as any).id ? {
                    ...g,
                    title: editForm.title,
                    description: editForm.description,
                    deadline: new Date(editForm.deadline + 'T00:00:00').toLocaleDateString('pt-BR'),
                    progress: editForm.progress,
                    status: editForm.isCompleted ? 'hit' : (editForm.progress >= 100 ? 'hit' : 'in_progress'),
                  } : g))
                  toast.success('Meta atualizada')
                  setEditGoal(null)
                } catch (e) {
                  toast.error('Não foi possível salvar as alterações')
                }
              }}
            >
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-roboto font-medium text-rich-black-900">Título</label>
                  <input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="mt-1 w-full bg-white border border-platinum-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-roboto font-medium text-rich-black-900">Descrição</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="mt-1 w-full bg-white border border-platinum-300 rounded-lg px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-roboto font-medium text-rich-black-900">Prazo</label>
                    <input type="date" min={new Date().toISOString().split('T')[0]} value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className="mt-1 w-full bg-white border border-platinum-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-roboto font-medium text-rich-black-900">Progresso</label>
                    <input type="number" min={0} max={100} value={editForm.progress} onChange={(e) => setEditForm({ ...editForm, progress: Math.max(0, Math.min(100, Number(e.target.value))) })} className="mt-1 w-full bg-white border border-platinum-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="chk_done" type="checkbox" checked={editForm.isCompleted} onChange={(e) => setEditForm({ ...editForm, isCompleted: e.target.checked })} />
                  <label htmlFor="chk_done" className="text-sm font-roboto">Marcar como batida</label>
                </div>
              </div>
              <div className="p-4 border-t border-platinum-200 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditGoal(null)} className="px-4 py-2 rounded-xl bg-platinum-100 text-oxford-blue-700 hover:bg-platinum-200 text-sm">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#1B263B' }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsGoal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setDetailsGoal(null)}>
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-platinum-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-platinum-200">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Detalhes da Meta</h3>
              <button className="p-2 rounded-lg hover:bg-platinum-100" onClick={() => setDetailsGoal(null)}>
                <X className="w-4 h-4 text-oxford-blue-600" />
              </button>
            </div>
            <div className="p-4 space-y-2 text-sm">
              <p><strong>Título:</strong> {detailsGoal.title}</p>
              <p><strong>Descrição:</strong> {detailsGoal.description || '—'}</p>
              <p><strong>Responsável:</strong> {detailsGoal.assignedTo}</p>
              <p><strong>Prazo:</strong> {detailsGoal.deadline}</p>
              <p><strong>Status:</strong> {getStatusText(detailsGoal.status)}</p>
              <p><strong>Progresso:</strong> {detailsGoal.progress}%</p>
            </div>
          </div>
        </div>
      )}

      {filteredGoals.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-16 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Target className="h-10 w-10 text-oxford-blue-400" />
          </div>
          <h3 className="text-xl font-roboto font-light text-rich-black-900 mb-4 tracking-wide">Nenhuma meta encontrada</h3>
          <p className="text-sm text-oxford-blue-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
            Tente ajustar sua busca ou crie uma nova meta para começar a acompanhar o desenvolvimento dos colaboradores
          </p>
          <button onClick={() => setShowNewGoalModal(true)} className="bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto mt-8">
            <Plus className="h-4 w-4" />
            Criar Primeira Meta
          </button>
        </div>
      )}

      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowNewGoalModal(false)}>
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-platinum-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-platinum-200">
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Nova Meta</h3>
                <button className="p-2 rounded-lg hover:bg-platinum-100" onClick={() => setShowNewGoalModal(false)}>
                  <X className="w-4 h-4 text-oxford-blue-600" />
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!newGoal.title || !newGoal.deadline || !selectedEmployeeId) {
                    toast.error('Preencha título, prazo e responsável')
                    return
                  }
                  const picked = new Date(newGoal.deadline + 'T00:00:00')
                  const today = new Date()
                  today.setHours(0,0,0,0)
                  if (picked < today) {
                    toast.error('O prazo não pode ser uma data no passado')
                    return
                  }
                  try {
                    const { data: userData } = await supabase.auth.getUser()
                    const userId = userData?.user?.id || null
                    // Verificar se o perfil do usuário existe; se não existir, evitar violar FK em goals.created_by
                    let createdBy: string | null = null
                    if (userId) {
                      const { data: profile, error: profileErr } = await (supabase as any)
                        .from('profiles')
                        .select('id')
                        .eq('id', userId)
                        .maybeSingle()
                      if (!profileErr && profile?.id) {
                        createdBy = userId
                      } else {
                        createdBy = null
                      }
                    }
                    // Validação extra: garantir que o employee_id existe para evitar violação de FK
                    const { data: employeeRow, error: employeeErr } = await (supabase as any)
                      .from('employees')
                      .select('id, full_name')
                      .eq('id', selectedEmployeeId)
                      .single()
                    if (employeeErr || !employeeRow) {
                      toast.error('Responsável inválido: colaborador não encontrado')
                      return
                    }
                    const { data: createdGoal, error } = await (supabase as any)
                      .from('goals')
                      .insert([
                        {
                          employee_id: selectedEmployeeId,
                          title: newGoal.title,
                          description: newGoal.description,
                          target_date: newGoal.deadline,
                          progress: 0,
                          is_completed: false,
                          created_by: createdBy,
                        }
                      ])
                      .select('id')
                      .single()
                    if (error) throw error
                    // Recarrega a lista a partir do banco para manter consistência
                    await loadGoals()
                  } catch (e: any) {
                    console.error('Erro ao criar meta:', e)
                    const code = e?.code || e?.status || 'erro'
                    const details = e?.details || e?.hint || ''
                    toast.error(`Erro (${code}): ${e?.message || 'Falha ao salvar meta'}${details ? ` — ${details}` : ''}`)
                    return
                  }
                  // Fecha modal e reseta formulário após sucesso
                  setShowNewGoalModal(false)
                  setNewGoal({ title: '', description: '', category: 'performance', priority: 'medium', deadline: '', assignedTo: '' })
                  setDepartmentId('')
                  setSelectedEmployeeId('')
                  toast.success('Meta criada')
                }}
              >
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-sm font-roboto font-medium text-rich-black-900">Título</label>
                    <input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} className="mt-1 w-full bg-white border border-platinum-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-roboto font-medium text-rich-black-900">Descrição</label>
                    <textarea value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} className="mt-1 w-full bg-white border border-platinum-300 rounded-lg px-3 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-roboto font-medium text-rich-black-900">Categoria</label>
                      <div className="relative mt-1">
                        <select value={newGoal.category} onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })} className="w-full bg-white border border-platinum-300 rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 appearance-none no-native-arrow">
                          <option value="performance">Performance</option>
                          <option value="skill">Habilidade</option>
                          <option value="career">Carreira</option>
                          <option value="personal">Pessoal</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-600" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-roboto font-medium text-rich-black-900">Prioridade</label>
                      <div className="relative mt-1">
                        <select value={newGoal.priority} onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })} className="w-full bg-white border border-platinum-300 rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 appearance-none no-native-arrow">
                          <option value="low">Baixa</option>
                          <option value="medium">Média</option>
                          <option value="high">Alta</option>
                          <option value="critical">Crítica</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-roboto font-medium text-rich-black-900">Prazo</label>
                      <input type="date" value={newGoal.deadline} min={new Date().toISOString().split('T')[0]} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} className="mt-1 w-full bg-white border border-platinum-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500" />
                    </div>
                    <div>
                      <label className="text-sm font-roboto font-medium text-rich-black-900">Setor</label>
                      <div className="relative mt-1">
                        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full bg-white border border-platinum-300 rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 appearance-none no-native-arrow">
                          <option value="">Selecione</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-roboto font-medium text-rich-black-900">Responsável</label>
                    <div className="relative mt-1">
                      <select value={selectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} disabled={!departmentId || loadingEmployees} className="w-full bg-white border border-platinum-300 rounded-lg px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 appearance-none no-native-arrow">
                        <option value="">Selecione</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-platinum-200 flex items-center justify-end gap-2">
                  <button type="button" onClick={() => setShowNewGoalModal(false)} className="px-4 py-2 rounded-xl bg-platinum-100 text-oxford-blue-700 hover:bg-platinum-200 text-sm">Cancelar</button>
                  <button type="submit" className="px-4 py-2 rounded-xl text-white text-sm" style={{ backgroundColor: '#1B263B' }}>Criar Meta</button>
                </div>
              </form>
            </div>
        </div>
      )}
    </div>
  )
}