'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Users,
  Search,
  Plus,
  Star,
  TrendingUp,
  TrendingDown,
  Building,
  UserPlus,
  Award,
  Eye,
  Edit,
  Grid3X3,
  List,
  Mail,
  Phone,
  Power,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Employee {
  id: string
  name: string
  email: string
  position: string
  department: string
  score: number
  trend: 'up' | 'down' | 'stable'
  evaluations: number
  stars: number
  avatar: string
  avatarUrl?: string
  isActive: boolean
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'employee'>('employee')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  // Mantido como referência caso volte o envio de convites por e-mail
  // const [inviteEmail, setInviteEmail] = useState('')
  // const [sendingInvite, setSendingInvite] = useState(false)

  // ID específico que deve ter bypass para ver os botões
  const BYPASS_USER_ID = 'd4f6ea0c-0ddc-41a4-a6d4-163fea1916c3'

  // Função para verificar se o usuário pode ver os botões de ação
  const canViewActionButtons = () => {
    return userRole === 'admin' || userId === BYPASS_USER_ID
  }

  useEffect(() => {
    loadEmployees()
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        // Armazenar o ID do usuário para verificação de bypass
        setUserId(user.id)
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single<{ role: string | null }>()
        const r = (profile?.role || '').toLowerCase().trim()
        setUserRole(r === 'admin' || r === 'administrador' ? 'admin' : r === 'manager' || r === 'gerente' ? 'manager' : 'employee')
      } catch (e) {
      }
    })()
  }, [])

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true })

      if (error) {
        toast.error('Erro ao carregar funcionários: ' + error.message)
        throw error
      }
      // Pré-carregar contagens de avaliações e feedbacks para todos os colaboradores em lote
      const employeeIds = (data || []).map((e: any) => e.id)
      let evaluationsCountByEmployee: Record<string, number> = {}
      let scoreByEmployee: Record<string, number> = {}
      let trendByEmployee: Record<string, 'up' | 'down' | 'stable'> = {}
      let starsCountByEmployee: Record<string, number> = {}

      if (employeeIds.length > 0) {
        // Contagem de avaliações por employee_id
        const { data: evalRows } = await (supabase as any)
          .from('evaluations')
          .select('employee_id, overall_score, status, created_at, submitted_at')
          .in('employee_id', employeeIds)

        // Supabase não retorna count por grupo diretamente; agregamos manualmente
        if (Array.isArray(evalRows)) {
          const sumByEmployee: Record<string, number> = {}
          const completedCountByEmployee: Record<string, number> = {}
          // Acúmulos para janelas de 90 dias (tendência)
          const now = new Date()
          const last90Start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          const prev90Start = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
          const lastSumByEmployee: Record<string, number> = {}
          const lastCountByEmployee: Record<string, number> = {}
          const prevSumByEmployee: Record<string, number> = {}
          const prevCountByEmployee: Record<string, number> = {}

          for (const row of evalRows as Array<{ employee_id: string; overall_score: number | null; status: string; created_at?: string; submitted_at?: string }>) {
            const key = (row as any).employee_id
            if (!key) continue
            // Contagem total de avaliações (qualquer status)
            evaluationsCountByEmployee[key] = (evaluationsCountByEmployee[key] || 0) + 1
            // Média de performance apenas para avaliações concluídas/revisadas
            const status = (row as any).status
            const score = (row as any).overall_score
            const isCompleted = status === 'completed' || status === 'reviewed'
            if (isCompleted && typeof score === 'number') {
              sumByEmployee[key] = (sumByEmployee[key] || 0) + score
              completedCountByEmployee[key] = (completedCountByEmployee[key] || 0) + 1

              // Separar por janelas temporais para tendência
              const dateStr = (row as any).submitted_at || (row as any).created_at
              const d = dateStr ? new Date(dateStr) : null
              if (d) {
                if (d >= last90Start && d <= now) {
                  lastSumByEmployee[key] = (lastSumByEmployee[key] || 0) + score
                  lastCountByEmployee[key] = (lastCountByEmployee[key] || 0) + 1
                } else if (d >= prev90Start && d < last90Start) {
                  prevSumByEmployee[key] = (prevSumByEmployee[key] || 0) + score
                  prevCountByEmployee[key] = (prevCountByEmployee[key] || 0) + 1
                }
              }
            }
          }
          for (const empId of Object.keys(sumByEmployee)) {
            const count = completedCountByEmployee[empId] || 0
            if (count > 0) {
              const avg = sumByEmployee[empId] / count
              // 1 casa decimal como string e volta para número
              scoreByEmployee[empId] = parseFloat(avg.toFixed(1))
            }
          }

          // Definir tendência com base nas janelas (limiar 0.5)
          for (const empId of employeeIds) {
            const lastCount = lastCountByEmployee[empId] || 0
            const prevCount = prevCountByEmployee[empId] || 0
            if (lastCount > 0 && prevCount > 0) {
              const lastAvg = lastSumByEmployee[empId] / lastCount
              const prevAvg = prevSumByEmployee[empId] / prevCount
              const diff = lastAvg - prevAvg
              if (diff >= 0.5) trendByEmployee[empId] = 'up'
              else if (diff <= -0.5) trendByEmployee[empId] = 'down'
              else trendByEmployee[empId] = 'stable'
            } else {
              trendByEmployee[empId] = 'stable'
            }
          }
        }

        // Contagem de estrelas recebidas por recipient_id
        const { data: starRows } = await (supabase as any)
          .from('user_stars')
          .select('recipient_id')
          .in('recipient_id', employeeIds)

        if (Array.isArray(starRows)) {
          for (const row of starRows as Array<{ recipient_id: string }>) {
            const key = (row as any).recipient_id
            if (!key) continue
            starsCountByEmployee[key] = (starsCountByEmployee[key] || 0) + 1
          }
        }
      }

      const mapped: Employee[] = await Promise.all((data || []).map(async (e: any) => {
        let departmentName = '—'
        
        if (e.department) {
          try {
            const { data: deptData } = await supabase
              .from('departments')
              .select('name')
              .eq('id', e.department)
              .single()
            
            if (deptData) {
              departmentName = (deptData as any).name || '—'
            }
          } catch (error) {
            console.error('Erro ao buscar departamento:', error)
          }
        }

        return {
          id: e.id,
          name: e.full_name,
          email: e.email || '',
          position: e.position || '',
          department: departmentName,
          score: scoreByEmployee[e.id] || 0,
          trend: trendByEmployee[e.id] || 'stable',
          evaluations: evaluationsCountByEmployee[e.id] || 0,
          stars: starsCountByEmployee[e.id] || 0,
          avatar: (e.full_name || e.email || '?')
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase(),
          avatarUrl: e.avatar_url || '',
          isActive: e.is_active !== false,
        }
      }))

      setEmployees(mapped)
    } catch (error) {
      toast.error('Erro ao carregar colaboradores')
    } finally {
      setLoading(false)
    }
  }

  const departments = ['all', ...new Set(employees.map(e => e.department))]
  const filteredEmployees = employees
    .filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment
      const matchesStatus = selectedStatus === 'all' || (selectedStatus === 'active' ? employee.isActive : !employee.isActive)
      return matchesSearch && matchesDepartment && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'department') return a.department.localeCompare(b.department)
      return 0
    })
  const toggleActive = async (employeeId: string, nextActive: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('employees')
        .update({ is_active: nextActive } as any)
        .eq('id', employeeId)

      if (error) throw error
      setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, isActive: nextActive } : e))
      toast.success(`Colaborador ${nextActive ? 'ativado' : 'inativado'} com sucesso`)
    } catch (e: any) {
      toast.error('Não foi possível atualizar o status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando colaboradores...</div>
      </div>  
    )
  }

  return (
    <div className="space-y-6 pb-12">
      
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Gerencie e visualize o desempenho de todos os colaboradores</h1>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          style={{ backgroundColor: '#1B263B' }}
        >
          <UserPlus className="h-4 w-4" />
          Novo Colaborador
        </button>
                </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Colaboradores</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{employees.filter(e => e.isActive).length}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">funcionários ativos</p>
                </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#778DA9]" />
                        </div>
                      </div>
                    </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
                      <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Média de Performance</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {(employees.reduce((acc, e) => acc + e.score, 0) / employees.length || 0).toFixed(1)}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">pontuação geral</p>
                      </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-[#778DA9]" />
                            </div>
                          </div>
                        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Em Alta</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {employees.filter(e => e.trend === 'up').length}
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
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Departamentos</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {new Set(employees.map(e => e.department)).size}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">áreas diferentes</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 sm:py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Buscar por nome, email ou cargo..."
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Ver por:</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'Todos os Departamentos' : dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Ordenar:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="name">Nome</option>
                <option value="score">Pontuação</option>
                <option value="department">Departamento</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Visualizar:</label>
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
      
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
          {/* Indicador de scroll horizontal para mobile */}
          <div className="lg:hidden px-4 py-2 bg-platinum-50 border-b border-platinum-200">
            <div className="flex items-center justify-center text-xs font-roboto font-medium text-oxford-blue-500">
              <span className="flex items-center gap-1">
                ← Deslize para ver mais colunas →
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-platinum-50 border-b border-platinum-200">
                <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                  <th className="px-3 sm:px-6 py-4 min-w-[200px]">Colaborador</th>
                  <th className="px-3 sm:px-6 py-4 min-w-[150px]">Cargo</th>
                  <th className="px-3 sm:px-6 py-4 min-w-[120px]">Departamento</th>
                  <th className="px-3 sm:px-6 py-4 min-w-[120px]">Status</th>
                  <th className="px-3 sm:px-6 py-4 text-center min-w-[100px]">Performance</th>
                  <th className="px-3 sm:px-6 py-4 text-center min-w-[100px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-platinum-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-xs sm:text-sm font-roboto font-semibold text-white">
                          {employee.avatarUrl ? (
                            <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
                          ) : (
                            employee.avatar
                          )}
                        </div>
                        <div className="ml-2 sm:ml-3 min-w-0 flex-1">
                          <p className="font-roboto font-medium text-rich-black-900 text-sm sm:text-base truncate">{employee.name}</p>
                          <p className="text-xs sm:text-sm font-roboto font-light text-oxford-blue-600 truncate">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900 block truncate max-w-[140px]">{employee.position}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700 truncate max-w-[100px]">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`${employee.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium`}>
                        {employee.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-roboto font-semibold text-rich-black-900 text-sm sm:text-base">{employee.score}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-center">
                      {canViewActionButtons() && (
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Link href={`/employees/${employee.id}`}>
                            <button className="p-1.5 sm:p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </Link>
                          <Link href={`/employees/${employee.id}?edit=1`}>
                            <button className="p-1.5 sm:p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => toggleActive(employee.id, !employee.isActive)}
                            className={`${employee.isActive ? 'text-green-700 hover:bg-green-50' : 'text-red-700 hover:bg-red-50'} p-1.5 sm:p-2 rounded-lg transition-all duration-200`}
                            title={employee.isActive ? 'Inativar' : 'Ativar'}
                          >
                            <Power className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200">
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                    {employee.avatarUrl ? (
                      <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
                    ) : (
                      employee.avatar
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-roboto font-medium text-rich-black-900 text-lg">{employee.name}</h3>
                      <span className={`${employee.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium`}>
                        {employee.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm font-roboto font-light text-oxford-blue-600">{employee.position}</p>
                  </div>
                </div>
                {canViewActionButtons() && (
                  <div className="flex items-center gap-2">
                    <Link href={`/employees/${employee.id}`}>
                      <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <Link href={`/employees/${employee.id}?edit=1`}>
                      <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                        <Edit className="h-4 w-4" />
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-oxford-blue-400" />
                  <span className="text-sm font-roboto font-light text-oxford-blue-600">{employee.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-oxford-blue-400" />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                    {employee.department}
                  </span>
                </div>

                
                <div className="bg-platinum-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-roboto font-medium text-oxford-blue-500">Performance</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-roboto font-semibold text-rich-black-900">{employee.score}</span>
                    </div>
                  </div>
                  <div className="w-full bg-platinum-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yinmn-blue-500 to-yinmn-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(employee.score / 10) * 100}%` }}
                    />
                  </div>
                </div>

                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-platinum-50 to-platinum-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">Avaliações</span>
                      <Award className="h-4 w-4 text-oxford-blue-400" />
                    </div>
                    <p className="text-2xl font-roboto font-semibold text-rich-black-900">{employee.evaluations}</p>
                  </div>
                  <div className="bg-gradient-to-br from-platinum-50 to-platinum-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">Estrelas</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </div>
                    <p className="text-2xl font-roboto font-semibold text-rich-black-900">{employee.stars}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsInviteOpen(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-lg border border-platinum-200 p-6">
            <h3 className="text-lg font-roboto font-medium text-rich-black-900 mb-2">Como adicionar um novo colaborador</h3>
            <p className="text-sm font-roboto font-light text-oxford-blue-600 mb-4">
              Peça para o colaborador criar a conta dele acessando o link abaixo. Após o cadastro, o perfil será criado automaticamente no sistema.
            </p>
            <a
              href="https://rh.investmoneysa.com.br/register"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-full px-4 py-3 rounded-lg text-white hover:opacity-90"
              style={{ backgroundColor: '#1B263B' }}
            >
              Acessar página de cadastro
            </a>
            <p className="text-xs font-roboto font-light text-oxford-blue-600 mt-3 text-center">
              Ou acesse: 
              {' '}
              <a
                href="https://rh.investmoneysa.com.br/register"
                target="_blank"
                rel="noreferrer"
                className="underline text-yinmn-blue-600 hover:text-yinmn-blue-700 break-all"
              >
                https://rh.investmoneysa.com.br/register
              </a>
            </p>
            <div className="flex items-center justify-end mt-4">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 rounded-lg border border-platinum-300 text-oxford-blue-700 hover:bg-platinum-50"
              >
                Fechar
              </button>
            </div>

            {/** Lógica anterior de envio de convite por e-mail mantida fora do JSX como referência.
             * Estados: inviteEmail, sendingInvite
             * Ação: POST /api/users/invite { email }
             */}
          </div>
        </div>
      )}
    </div>
  )
}
