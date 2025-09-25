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
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend === 'down') return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
    return <Activity className="h-4 w-4 text-slate-400" />
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Building className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
          <p className="text-slate-600 font-roboto font-light tracking-wide">Carregando departamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-roboto text-slate-900 tracking-tight" style={{ fontWeight: 100 }}>
            Departamentos
          </h1>
          <p className="text-lg text-slate-500 mt-3 font-roboto font-light tracking-wide">
            Gerencie e acompanhe o desempenho de cada departamento
          </p>
        </div>
        <button 
          onClick={() => setShowNewDepartment(true)}
          className="btn-primary flex items-center gap-3"
        >
          <Plus className="h-5 w-5" />
          Novo Departamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="card-elegant p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl flex items-center justify-center shadow-sm">
              <Building className="h-8 w-8 text-blue-600" />
            </div>
            <span className="text-xs font-light flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-sm text-blue-700 bg-blue-50/80 border border-blue-200/50">
              <span className="tracking-wide">Ativo</span>
            </span>
          </div>
          <div>
            <p className="text-4xl font-roboto text-slate-900 mb-3 tracking-tight" style={{ fontWeight: 100 }}>{departments.length}</p>
            <p className="text-sm font-roboto font-light text-slate-500 tracking-wide">Total de Departamentos</p>
          </div>
        </div>
        
        <div className="card-elegant p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-green-50 to-green-100/50 rounded-3xl flex items-center justify-center shadow-sm">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <span className="text-xs font-light flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-sm text-green-700 bg-green-50/80 border border-green-200/50">
              <span className="tracking-wide">Crescendo</span>
            </span>
          </div>
          <div>
            <p className="text-4xl font-roboto text-slate-900 mb-3 tracking-tight" style={{ fontWeight: 100 }}>
              {departments.reduce((acc, dept) => acc + dept.employeeCount, 0)}
            </p>
            <p className="text-sm font-roboto font-light text-slate-500 tracking-wide">Total de Colaboradores</p>
          </div>
        </div>
        
        <div className="card-elegant p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-3xl flex items-center justify-center shadow-sm">
              <Star className="h-8 w-8 text-amber-600" />
            </div>
            <span className="text-xs font-light flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-sm text-amber-700 bg-amber-50/80 border border-amber-200/50">
              <span className="tracking-wide">Excelente</span>
            </span>
          </div>
          <div>
            <p className="text-4xl font-roboto text-slate-900 mb-3 tracking-tight" style={{ fontWeight: 100 }}>
              {(departments.reduce((acc, dept) => acc + dept.averageScore, 0) / departments.length).toFixed(1)}
            </p>
            <p className="text-sm font-roboto font-light text-slate-500 tracking-wide">Média Geral</p>
          </div>
        </div>
        
        <div className="card-elegant p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl flex items-center justify-center shadow-sm">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <span className="text-xs font-light flex items-center gap-1.5 px-4 py-2 rounded-full backdrop-blur-sm text-purple-700 bg-purple-50/80 border border-purple-200/50">
              <span className="tracking-wide">Meta</span>
            </span>
          </div>
          <div>
            <p className="text-4xl font-roboto text-slate-900 mb-3 tracking-tight" style={{ fontWeight: 100 }}>
              {Math.round(
                (departments.reduce((acc, dept) => acc + dept.completedGoals, 0) /
                departments.reduce((acc, dept) => acc + dept.goals, 0)) * 100
              )}%
            </p>
            <p className="text-sm font-roboto font-light text-slate-500 tracking-wide">Taxa de Metas</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card-elegant p-8">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl text-slate-900 placeholder-slate-400 font-roboto font-light tracking-wide focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-100/40 focus:bg-white hover:bg-white hover:border-slate-300/60 transition-all duration-300 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.02)]"
            placeholder="Buscar departamentos por nome, gerente ou descrição..."
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredDepartments.map((dept) => (
          <div key={dept.id} className="card-elegant group">
            <div className="p-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100/50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500">
                    <Building className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-roboto font-light text-slate-900 text-xl tracking-wide">{dept.name}</h3>
                    <p className="text-sm text-slate-600 font-roboto font-light tracking-wide mt-1">
                      <Briefcase className="h-4 w-4 inline mr-2" />
                      {dept.manager}
                    </p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600 font-roboto font-light tracking-wide mb-8 leading-relaxed">{dept.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-slate-50/50 to-slate-100/30 rounded-2xl p-6 border border-slate-100/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 font-roboto font-light tracking-widest uppercase">Colaboradores</span>
                    <Users className="h-4 w-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-roboto text-slate-900 tracking-tight" style={{ fontWeight: 100 }}>{dept.employeeCount}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50/50 to-slate-100/30 rounded-2xl p-6 border border-slate-100/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500 font-roboto font-light tracking-widest uppercase">Média</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(dept.trend)}
                    </div>
                  </div>
                  <p className="text-2xl font-roboto text-slate-900 tracking-tight" style={{ fontWeight: 100 }}>{dept.averageScore}</p>
                </div>
              </div>

              {/* Goals Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-slate-600 font-roboto font-light tracking-wide">Progresso das Metas</span>
                  <span className="text-slate-900 font-roboto font-medium">{dept.completedGoals}/{dept.goals}</span>
                </div>
                <div className="h-3 bg-gradient-to-r from-slate-100 to-slate-200/50 rounded-full overflow-hidden border border-slate-200/50">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 rounded-full"
                    style={{ width: `${(dept.completedGoals / dept.goals) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 font-roboto font-light tracking-wide mt-2">
                  {Math.round((dept.completedGoals / dept.goals) * 100)}% concluído
                </p>
              </div>

              {/* Top Performers */}
              <div className="border-t border-slate-100/60 pt-8">
                <p className="text-xs text-slate-500 font-roboto font-light tracking-widest uppercase mb-6">Melhores Desempenhos</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-3">
                    {dept.topPerformers.map((performer, index) => (
                      <div
                        key={performer.id}
                        className="relative group/avatar"
                        style={{ zIndex: dept.topPerformers.length - index }}
                      >
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200/50 border-3 border-white flex items-center justify-center text-xs font-roboto font-medium text-blue-700 shadow-sm group-hover/avatar:shadow-md transition-all duration-300">
                          {performer.avatar}
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-roboto font-light opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
                          {performer.name} - {performer.score}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href={`/departments/${dept.id}`}>
                    <button className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200/50 border border-slate-200/60 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:from-blue-50 hover:to-blue-100/50 hover:border-blue-200/60 transition-all duration-300 shadow-sm hover:shadow-md">
                      <ChevronRight className="h-5 w-5" />
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
        <div className="card-elegant p-16 text-center">
          <div className="h-20 w-20 bg-gradient-to-br from-slate-100 to-slate-200/50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Building className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-roboto font-light text-slate-900 mb-4 tracking-wide">Nenhum departamento encontrado</h3>
          <p className="text-sm text-slate-600 font-roboto font-light tracking-wide leading-relaxed max-w-md mx-auto">
            Tente ajustar sua busca ou crie um novo departamento para começar a gerenciar sua equipe
          </p>
          <button 
            onClick={() => setShowNewDepartment(true)}
            className="btn-primary mt-8"
          >
            <Plus className="h-5 w-5 mr-2" />
            Criar Primeiro Departamento
          </button>
        </div>
      )}
    </div>
  )
}






