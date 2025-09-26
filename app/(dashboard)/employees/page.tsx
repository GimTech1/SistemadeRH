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
  feedbacks: number
  avatar: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('full_name', { ascending: true })

      if (error) {
        throw error
      }

      const mapped: Employee[] = (data || []).map((e: any) => ({
        id: e.id,
        name: e.full_name,
        email: e.email || '',
        position: e.position || '',
        department: e.department || '—',
        score: 0,
        trend: 'stable',
        evaluations: 0,
        feedbacks: 0,
        avatar: (e.full_name || e.email || '?')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase(),
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
      return matchesSearch && matchesDepartment
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'department') return a.department.localeCompare(b.department)
      return 0
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando colaboradores...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">Gerencie e visualize o desempenho de todos os colaboradores</h1>
        </div>
        <Link href="/employees/new">
          <button className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" style={{ backgroundColor: '#1B263B' }}>
            <UserPlus className="h-4 w-4" />
            Novo Colaborador
          </button>
        </Link>
                </div>
                
      {/* Cards de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Colaboradores</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{employees.length}</p>
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
                placeholder="Buscar por nome, email ou cargo..."
              />
            </div>
          </div>
          
          {/* Controles */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Ver por:</label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'Todos os Departamentos' : dept}
              </option>
            ))}
          </select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-roboto font-medium text-rich-black-900">Ordenar:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-4 py-2 pr-8 text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="name">Nome</option>
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
          </div>
        </div>
      </div>


      {/* Visualização de funcionários */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
              <thead className="bg-platinum-50 border-b border-platinum-200">
                <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Colaborador</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Departamento</th>
                  <th className="px-6 py-4 text-center">Performance</th>
                  <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-platinum-200">
              {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-platinum-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                        {employee.avatar}
                      </div>
                      <div className="ml-3">
                          <p className="font-roboto font-medium text-rich-black-900">{employee.name}</p>
                          <p className="text-sm font-roboto font-light text-oxford-blue-600">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-roboto font-medium text-rich-black-900">{employee.position}</span>
                  </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                    {employee.department}
                      </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-roboto font-semibold text-rich-black-900">{employee.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
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
              {/* Header do card */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center text-sm font-roboto font-semibold text-white">
                    {employee.avatar}
                  </div>
                  <div>
                    <h3 className="font-roboto font-medium text-rich-black-900 text-lg">{employee.name}</h3>
                    <p className="text-sm font-roboto font-light text-oxford-blue-600">{employee.position}</p>
                  </div>
                </div>
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
              </div>

              {/* Informações do colaborador */}
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

                {/* Performance */}
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

                {/* Estatísticas */}
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
                      <span className="text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">Feedbacks</span>
                      <Users className="h-4 w-4 text-oxford-blue-400" />
                    </div>
                    <p className="text-2xl font-roboto font-semibold text-rich-black-900">{employee.feedbacks}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
