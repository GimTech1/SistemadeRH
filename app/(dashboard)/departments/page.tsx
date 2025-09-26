'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Building,
  Users,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Edit,
  MoreVertical,
  ChevronRight,
  Star,
  Activity,
  Briefcase,
  Eye,
  Trash2,
  Grid3X3,
  List,
  Mail,
  Phone,
  X,
  Save,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import * as Dialog from '@radix-ui/react-dialog'

interface Department {
  id: string
  name: string
  manager: string
  managerId: string
  employeeCount: number
  averageScore: number
  trend: 'up' | 'down' | 'stable'
  description: string
  goals: number
  completedGoals: number
  topPerformers: {
    id: string
    name: string
    score: number
    avatar: string
  }[]
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    manager_id: '',
    parent_department_id: ''
  })
  const [availableManagers, setAvailableManagers] = useState<Array<{id: string, name: string, position: string}>>([])
  const [loadingManagers, setLoadingManagers] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadDepartments()
    loadAvailableManagers()
  }, [])

  const loadAvailableManagers = async () => {
    setLoadingManagers(true)
    try {
      
      // Primeiro, vamos ver todos os profiles
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('id, full_name, position, role, is_active')


      // Agora buscar apenas admin e gerente
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, position, role, is_active')
        .in('role', ['admin', 'gerente'])
        .eq('is_active', true)
        .order('full_name', { ascending: true })


      if (error) {
        toast.error('Erro ao carregar lista de gerentes')
        setAvailableManagers([])
        return
      }

      const managers = (data || []).map((profile: any) => ({
        id: profile.id,
        name: profile.full_name || 'Nome não informado',
        position: profile.position || 'Cargo não informado'
      }))

      setAvailableManagers(managers)
    } catch (error) {
      toast.error('Erro ao carregar lista de gerentes')
      setAvailableManagers([])
    } finally {
      setLoadingManagers(false)
    }
  }

  const loadDepartments = async () => {
    try {
      setDepartments([
        {
          id: '1',
          name: 'Vendas',
          manager: 'João Silva',
          managerId: '1',
          employeeCount: 24,
          averageScore: 8.4,
          trend: 'up',
          description: 'Responsável por prospecção, negociação e fechamento de vendas',
          goals: 15,
          completedGoals: 10,
          topPerformers: [
            { id: '1', name: 'Carlos Mendes', score: 9.2, avatar: 'CM' },
            { id: '2', name: 'Ana Costa', score: 9.0, avatar: 'AC' },
            { id: '3', name: 'Roberto Lima', score: 8.8, avatar: 'RL' },
          ],
        },
        {
          id: '2',
          name: 'Marketing',
          manager: 'Maria Santos',
          managerId: '2',
          employeeCount: 18,
          averageScore: 8.9,
          trend: 'up',
          description: 'Estratégias de marketing, branding e comunicação',
          goals: 12,
          completedGoals: 9,
          topPerformers: [
            { id: '4', name: 'Juliana Lima', score: 9.5, avatar: 'JL' },
            { id: '5', name: 'Pedro Alves', score: 9.3, avatar: 'PA' },
            { id: '6', name: 'Fernanda Silva', score: 9.1, avatar: 'FS' },
          ],
        },
        {
          id: '3',
          name: 'Tecnologia',
          manager: 'Pedro Costa',
          managerId: '3',
          employeeCount: 32,
          averageScore: 8.7,
          trend: 'stable',
          description: 'Desenvolvimento, infraestrutura e suporte técnico',
          goals: 20,
          completedGoals: 14,
          topPerformers: [
            { id: '7', name: 'Lucas Martins', score: 9.6, avatar: 'LM' },
            { id: '8', name: 'Marina Souza', score: 9.4, avatar: 'MS' },
            { id: '9', name: 'Rafael Santos', score: 9.2, avatar: 'RS' },
          ],
        },
        {
          id: '4',
          name: 'Recursos Humanos',
          manager: 'Ana Oliveira',
          managerId: '4',
          employeeCount: 12,
          averageScore: 9.1,
          trend: 'up',
          description: 'Gestão de pessoas, recrutamento e desenvolvimento organizacional',
          goals: 8,
          completedGoals: 7,
          topPerformers: [
            { id: '10', name: 'Beatriz Costa', score: 9.7, avatar: 'BC' },
            { id: '11', name: 'Thiago Oliveira', score: 9.5, avatar: 'TO' },
            { id: '12', name: 'Camila Rocha', score: 9.3, avatar: 'CR' },
          ],
        },
        {
          id: '5',
          name: 'Financeiro',
          manager: 'Carlos Ferreira',
          managerId: '5',
          employeeCount: 15,
          averageScore: 8.5,
          trend: 'down',
          description: 'Controladoria, tesouraria e planejamento financeiro',
          goals: 10,
          completedGoals: 6,
          topPerformers: [
            { id: '13', name: 'André Silva', score: 9.0, avatar: 'AS' },
            { id: '14', name: 'Patricia Lima', score: 8.8, avatar: 'PL' },
            { id: '15', name: 'Ricardo Alves', score: 8.6, avatar: 'RA' },
          ],
        },
        {
          id: '6',
          name: 'Operações',
          manager: 'Roberto Mendes',
          managerId: '6',
          employeeCount: 28,
          averageScore: 8.3,
          trend: 'stable',
          description: 'Logística, produção e gestão de processos operacionais',
          goals: 18,
          completedGoals: 12,
          topPerformers: [
            { id: '16', name: 'Marcos Silva', score: 8.9, avatar: 'MS' },
            { id: '17', name: 'Daniela Costa', score: 8.7, avatar: 'DC' },
            { id: '18', name: 'Paulo Santos', score: 8.5, avatar: 'PS' },
          ],
        },
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-emerald-500" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-oxford-blue-400" />
  }

  const handleCreateDepartment = async () => {
    if (!newDepartment.name.trim()) {
      toast.error('Nome do departamento é obrigatório')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newDepartment.name.trim(),
          description: newDepartment.description.trim() || null,
          manager_id: newDepartment.manager_id || null,
          parent_department_id: newDepartment.parent_department_id || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          toast.error(data.error || 'Você não tem permissão para criar departamentos')
        } else {
          throw new Error(data.error || 'Erro ao criar departamento')
        }
        return
      }

      toast.success('Departamento criado com sucesso!')
      setIsModalOpen(false)
      setNewDepartment({ name: '', description: '', manager_id: '', parent_department_id: '' })
      loadDepartments() // Recarregar a lista
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar departamento')
    } finally {
      setIsCreating(false)
    }
  }

  const filteredDepartments = departments
    .filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'score') return b.averageScore - a.averageScore
      if (sortBy === 'employees') return b.employeeCount - a.employeeCount
      return 0
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando departamentos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Gerencie e acompanhe o desempenho de cada departamento</h1>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" 
          style={{ backgroundColor: '#1B263B' }}
        >
          <Plus className="h-4 w-4" />
          Novo Departamento
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Departamentos</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{departments.length}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">áreas organizacionais</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Departamentos em Alta</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {departments.filter(dept => dept.trend === 'up').length}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">crescimento positivo</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Média Geral</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {(departments.reduce((acc, dept) => acc + dept.averageScore, 0) / departments.length).toFixed(1)}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">performance geral</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Taxa de Metas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {Math.round(
                  (departments.reduce((acc, dept) => acc + dept.completedGoals, 0) /
                  departments.reduce((acc, dept) => acc + dept.goals, 0)) * 100
                )}%
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">objetivos concluídos</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-[#778DA9]" />
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
                placeholder="Buscar departamentos por nome, gerente ou descrição..."
          />
        </div>
      </div>

          {/* Controles */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Ordenar:</label>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="name">Nome</option>
                <option value="score">Performance</option>
                <option value="employees">Colaboradores</option>
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
          </div>
        </div>
      </div>

      {/* Visualização de departamentos */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-platinum-50 border-b border-platinum-200">
                <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Departamento</th>
                  <th className="px-6 py-4">Gerente</th>
                  <th className="px-6 py-4 text-center">Colaboradores</th>
                  <th className="px-6 py-4 text-center">Performance</th>
                  <th className="px-6 py-4 text-center">Tendência</th>
                  <th className="px-6 py-4 text-center">Metas</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-200">
                {filteredDepartments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-platinum-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                          <Building className="w-5 h-5" />
                        </div>
                        <div className="ml-3">
                          <p className="font-roboto font-medium text-rich-black-900">{dept.name}</p>
                          <p className="text-sm font-roboto font-light text-oxford-blue-600">{dept.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-platinum-400 to-platinum-500 flex items-center justify-center text-xs font-roboto font-semibold text-white">
                          {dept.manager.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="ml-2 text-sm font-roboto font-medium text-rich-black-900">{dept.manager}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-roboto font-medium text-rich-black-900">{dept.employeeCount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-roboto font-semibold text-rich-black-900">{dept.averageScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getTrendIcon(dept.trend)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-roboto font-medium text-rich-black-900">
                          {dept.completedGoals}/{dept.goals}
                        </span>
                        <div className="w-16 h-2 bg-platinum-200 rounded-full mt-1">
                          <div 
                            className="h-full bg-gradient-to-r from-yinmn-blue-500 to-yinmn-blue-600 rounded-full"
                            style={{ width: `${(dept.completedGoals / dept.goals) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/departments/${dept.id}`}>
                          <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                            <Eye className="h-4 w-4" />
                          </button>
                        </Link>
                        <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                          <Trash2 className="h-4 w-4" />
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
        {filteredDepartments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200">
              {/* Header do card */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-roboto font-medium text-rich-black-900 text-lg">{dept.name}</h3>
                    <p className="text-sm font-roboto font-light text-oxford-blue-600">{dept.manager}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/departments/${dept.id}`}>
                    <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                    <Edit className="h-4 w-4" />
                </button>
                </div>
              </div>

              {/* Descrição */}
              <p className="text-sm font-roboto font-light text-oxford-blue-600 mb-6 leading-relaxed">{dept.description}</p>

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-platinum-50 to-platinum-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">Colaboradores</span>
                    <Users className="h-4 w-4 text-oxford-blue-400" />
                  </div>
                  <p className="text-2xl font-roboto font-semibold text-rich-black-900">{dept.employeeCount}</p>
                </div>
                <div className="bg-gradient-to-br from-platinum-50 to-platinum-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">Performance</span>
                    <div className="flex items-center gap-1">
                    {getTrendIcon(dept.trend)}
                  </div>
                  </div>
                  <p className="text-2xl font-roboto font-semibold text-rich-black-900">{dept.averageScore}</p>
                </div>
              </div>

              {/* Progresso das Metas */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-oxford-blue-600 font-roboto font-medium">Progresso das Metas</span>
                  <span className="text-rich-black-900 font-roboto font-semibold">{dept.completedGoals}/{dept.goals}</span>
                </div>
                <div className="w-full bg-platinum-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-yinmn-blue-500 to-yinmn-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(dept.completedGoals / dept.goals) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-oxford-blue-500 font-roboto font-light mt-2">
                  {Math.round((dept.completedGoals / dept.goals) * 100)}% concluído
                </p>
              </div>

              {/* Top Performers */}
              <div className="border-t border-platinum-200 pt-4">
                <p className="text-xs text-oxford-blue-500 font-roboto font-medium uppercase tracking-wider mb-4">Melhores Desempenhos</p>
                <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                    {dept.topPerformers.slice(0, 3).map((performer, index) => (
                    <div
                      key={performer.id}
                      className="relative group/avatar"
                      style={{ zIndex: dept.topPerformers.length - index }}
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-platinum-100 to-platinum-200 border-2 border-white flex items-center justify-center text-xs font-roboto font-semibold text-oxford-blue-700 shadow-sm">
                        {performer.avatar}
                      </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-rich-black-900 text-white rounded-lg text-xs font-roboto font-light opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 whitespace-nowrap">
                        {performer.name} - {performer.score}
                      </div>
                    </div>
                  ))}
                  </div>
                  <Link href={`/departments/${dept.id}`}>
                    <button className="h-8 w-8 rounded-full bg-gradient-to-br from-platinum-100 to-platinum-200 border border-platinum-200 flex items-center justify-center text-oxford-blue-600 hover:text-yinmn-blue-600 hover:from-yinmn-blue-50 hover:to-yinmn-blue-100 hover:border-yinmn-blue-200 transition-all duration-300">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-16 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-platinum-100 to-platinum-200 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Building className="h-10 w-10 text-oxford-blue-400" />
          </div>
          <h3 className="text-xl font-roboto font-light text-rich-black-900 mb-4 tracking-wide">Nenhum departamento encontrado</h3>
          <p className="text-sm text-oxford-blue-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
            Tente ajustar sua busca ou crie um novo departamento para começar a gerenciar sua equipe
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-yinmn-blue-600 hover:bg-yinmn-blue-700 text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 mx-auto mt-8"
          >
            <Plus className="h-4 w-4" />
            Criar Primeiro Departamento
          </button>
        </div>
      )}

      {/* Modal de Novo Departamento */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsModalOpen(false)} />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none"
            onPointerDownOutside={() => setIsModalOpen(false)}
            onInteractOutside={() => setIsModalOpen(false)}
            onEscapeKeyDown={() => setIsModalOpen(false)}
          >
            <div className="w-[min(100vw-2rem,32rem)] bg-white rounded-2xl shadow-2xl border border-platinum-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-platinum-200 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <Dialog.Title className="text-xl font-roboto font-semibold text-rich-black-900">Novo Departamento</Dialog.Title>
                    <Dialog.Description className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">
                      Crie um novo departamento para organizar sua equipe
                    </Dialog.Description>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-oxford-blue-400 hover:text-oxford-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Form */}
              <div className="p-6 space-y-6">
                {/* Nome do Departamento */}
                <div>
                  <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                    Nome do Departamento *
                  </label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-xl text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto"
                    placeholder="Ex: Recursos Humanos, Tecnologia, Vendas..."
                    required
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-xl text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto resize-none"
                    placeholder="Descreva as responsabilidades e objetivos do departamento..."
                  />
                </div>

                {/* Gerente */}
                <div>
                  <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                    Gerente do Departamento
                  </label>
                  <div className="relative">
                    <select
                      value={newDepartment.manager_id}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, manager_id: e.target.value }))}
                      className="w-full px-4 py-3 pr-10 bg-white border border-platinum-300 rounded-xl text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto cursor-pointer"
                      style={{ 
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: 'none'
                      }}
                      disabled={loadingManagers}
                    >
                      <option value="">Selecione um gerente (opcional)</option>
                      {availableManagers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.name} - {manager.position}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-oxford-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {loadingManagers && (
                    <p className="text-xs text-oxford-blue-500 mt-1 font-roboto">Carregando gerentes...</p>
                  )}
                  {!loadingManagers && availableManagers.length === 0 && (
                    <p className="text-xs text-oxford-blue-500 mt-1 font-roboto">
                      Nenhum gerente disponível. Crie perfis de usuário com role 'admin' ou 'manager' primeiro.
                    </p>
                  )}
                </div>

                {/* Departamento Pai */}
                <div>
                  <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                    Departamento Pai
                  </label>
                  <div className="relative">
                    <select
                      value={newDepartment.parent_department_id}
                      onChange={(e) => setNewDepartment(prev => ({ ...prev, parent_department_id: e.target.value }))}
                      className="w-full px-4 py-3 pr-10 bg-white border border-platinum-300 rounded-xl text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent font-roboto cursor-pointer"
                      style={{ 
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: 'none'
                      }}
                    >
                      <option value="">Selecione um departamento pai (opcional)</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-oxford-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-oxford-blue-500 mt-1 font-roboto">
                    Selecione um departamento pai para criar uma hierarquia organizacional
                  </p>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-platinum-200 bg-platinum-50 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating}
                  className="px-6 py-3 text-oxford-blue-600 hover:text-oxford-blue-700 font-roboto font-medium transition-all duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateDepartment}
                  disabled={isCreating || !newDepartment.name.trim()}
                  className="px-6 py-3 bg-yinmn-blue-600 hover:bg-yinmn-blue-700 disabled:bg-oxford-blue-300 text-white rounded-xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Criar Departamento
                    </>
                  )}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}