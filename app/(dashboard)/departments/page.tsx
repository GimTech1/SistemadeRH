'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Building,
  Users,
  Plus,
  Search,
  TrendingUp,
  Award,
  Target,
  Edit,
  MoreVertical,
  ChevronRight,
  Star,
  Activity,
  Briefcase,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

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
  const [showNewDepartment, setShowNewDepartment] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDepartments()
  }, [])

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
      console.error('Erro ao carregar departamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    return <Activity className="h-4 w-4 text-neutral-500" />
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl font-semibold text-neutral-50">Departamentos</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gerencie e acompanhe o desempenho de cada departamento
          </p>
        </div>
        <button 
          onClick={() => setShowNewDepartment(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Departamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total de Departamentos</p>
              <p className="text-2xl font-semibold text-neutral-50">{departments.length}</p>
            </div>
            <Building className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total de Colaboradores</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {departments.reduce((acc, dept) => acc + dept.employeeCount, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Média Geral</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {(departments.reduce((acc, dept) => acc + dept.averageScore, 0) / departments.length).toFixed(1)}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Taxa de Metas</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {Math.round(
                  (departments.reduce((acc, dept) => acc + dept.completedGoals, 0) /
                  departments.reduce((acc, dept) => acc + dept.goals, 0)) * 100
                )}%
              </p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200 placeholder-neutral-500"
            placeholder="Buscar departamentos..."
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div key={dept.id} className="card hover:bg-neutral-800/50 transition-all group">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Building className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-200 text-lg">{dept.name}</h3>
                    <p className="text-sm text-neutral-500">Gerente: {dept.manager}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-neutral-200">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-400 mb-4">{dept.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-neutral-900 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-500">Colaboradores</span>
                    <Users className="h-3 w-3 text-neutral-500" />
                  </div>
                  <p className="text-lg font-semibold text-neutral-200">{dept.employeeCount}</p>
                </div>
                <div className="bg-neutral-900 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-neutral-500">Média</span>
                    {getTrendIcon(dept.trend)}
                  </div>
                  <p className="text-lg font-semibold text-neutral-200">{dept.averageScore}</p>
                </div>
              </div>

              {/* Goals Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-neutral-500">Metas</span>
                  <span className="text-neutral-300">{dept.completedGoals}/{dept.goals}</span>
                </div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300"
                    style={{ width: `${(dept.completedGoals / dept.goals) * 100}%` }}
                  />
                </div>
              </div>

              {/* Top Performers */}
              <div className="border-t border-neutral-800 pt-4">
                <p className="text-xs text-neutral-500 mb-3">Top Performers</p>
                <div className="flex -space-x-2">
                  {dept.topPerformers.map((performer, index) => (
                    <div
                      key={performer.id}
                      className="relative group/avatar"
                      style={{ zIndex: dept.topPerformers.length - index }}
                    >
                      <div className="h-8 w-8 rounded-full bg-neutral-800 border-2 border-neutral-900 flex items-center justify-center text-xs font-medium text-neutral-300">
                        {performer.avatar}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 rounded text-xs text-neutral-200 opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap">
                        {performer.name} - {performer.score}
                      </div>
                    </div>
                  ))}
                  <Link href={`/departments/${dept.id}`}>
                    <button className="h-8 w-8 rounded-full bg-neutral-800 border-2 border-neutral-900 flex items-center justify-center text-xs text-neutral-400 hover:text-primary-500 hover:border-primary-500/50 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDepartments.length === 0 && (
        <div className="card p-12 text-center">
          <Building className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Nenhum departamento encontrado</h3>
          <p className="text-sm text-neutral-500">
            Tente ajustar sua busca ou crie um novo departamento
          </p>
        </div>
      )}
    </div>
  )
}






