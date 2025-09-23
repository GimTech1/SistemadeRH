'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Star,
  TrendingUp,
  TrendingDown,
  Building,
  Mail,
  ChevronRight,
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      // Simular dados
      setEmployees([
        {
          id: '1',
          name: 'João Silva',
          email: 'joao.silva@empresa.com',
          position: 'Analista de Vendas',
          department: 'Vendas',
          score: 8.7,
          trend: 'up',
          evaluations: 12,
          feedbacks: 24,
          avatar: 'JS',
        },
        {
          id: '2',
          name: 'Maria Santos',
          email: 'maria.santos@empresa.com',
          position: 'Gerente de Marketing',
          department: 'Marketing',
          score: 9.2,
          trend: 'up',
          evaluations: 15,
          feedbacks: 31,
          avatar: 'MS',
        },
        {
          id: '3',
          name: 'Pedro Costa',
          email: 'pedro.costa@empresa.com',
          position: 'Desenvolvedor Senior',
          department: 'TI',
          score: 8.5,
          trend: 'stable',
          evaluations: 10,
          feedbacks: 18,
          avatar: 'PC',
        },
        {
          id: '4',
          name: 'Ana Oliveira',
          email: 'ana.oliveira@empresa.com',
          position: 'Analista de RH',
          department: 'RH',
          score: 8.9,
          trend: 'up',
          evaluations: 11,
          feedbacks: 22,
          avatar: 'AO',
        },
        {
          id: '5',
          name: 'Carlos Mendes',
          email: 'carlos.mendes@empresa.com',
          position: 'Vendedor',
          department: 'Vendas',
          score: 7.8,
          trend: 'down',
          evaluations: 8,
          feedbacks: 15,
          avatar: 'CM',
        },
        {
          id: '6',
          name: 'Juliana Lima',
          email: 'juliana.lima@empresa.com',
          position: 'Designer',
          department: 'Marketing',
          score: 9.0,
          trend: 'up',
          evaluations: 13,
          feedbacks: 28,
          avatar: 'JL',
        },
      ])
    } catch (error) {
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
        <div className="text-neutral-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-50">Colaboradores</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Gerencie e visualize o desempenho de todos os colaboradores
          </p>
        </div>
        <Dialog.Root open={isNewOpen} onOpenChange={setIsNewOpen}>
          <Dialog.Trigger asChild>
            <button className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </button>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
            <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-lg card">
                <div className="p-6 border-b border-neutral-800">
                  <Dialog.Title className="text-lg font-semibold text-neutral-200">Adicionar colaborador</Dialog.Title>
                  <Dialog.Description className="text-sm text-neutral-400 mt-1">
                    Preencha as informações básicas do novo colaborador.
                  </Dialog.Description>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="emp-name">Nome completo</Label>
                    <Input
                      id="emp-name"
                      placeholder="João Silva"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emp-email">Email</Label>
                    <Input
                      id="emp-email"
                      type="email"
                      placeholder="joao@empresa.com"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emp-position">Cargo</Label>
                      <Input
                        id="emp-position"
                        placeholder="Analista"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emp-dept">Departamento</Label>
                      <Input
                        id="emp-dept"
                        placeholder="Vendas, Marketing, TI..."
                        value={newEmployee.department}
                        onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-neutral-800 flex items-center justify-end gap-2">
                  <Dialog.Close asChild>
                    <button className="btn-ghost">Cancelar</button>
                  </Dialog.Close>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      if (!newEmployee.name || !newEmployee.email || !newEmployee.position || !newEmployee.department) return
                      const id = String(Date.now())
                      setEmployees(prev => [
                        ...prev,
                        {
                          id,
                          name: newEmployee.name,
                          email: newEmployee.email,
                          position: newEmployee.position,
                          department: newEmployee.department,
                          score: 0,
                          trend: 'stable',
                          evaluations: 0,
                          feedbacks: 0,
                          avatar: newEmployee.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase(),
                        },
                      ])
                      setNewEmployee({ name: '', email: '', position: '', department: '' })
                      setIsNewOpen(false)
                    }}
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total</p>
              <p className="text-2xl font-semibold text-neutral-50">{employees.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Média Geral</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {(employees.reduce((acc, e) => acc + e.score, 0) / employees.length).toFixed(1)}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Em Alta</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {employees.filter(e => e.trend === 'up').length}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Departamentos</p>
              <p className="text-2xl font-semibold text-neutral-50">
                {new Set(employees.map(e => e.department)).size}
              </p>
            </div>
            <Building className="h-8 w-8 text-neutral-400" />
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
                placeholder="Buscar por nome, email ou cargo..."
              />
            </div>
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'Todos os Departamentos' : dept}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-200"
          >
            <option value="name">Ordenar por Nome</option>
            <option value="score">Ordenar por Pontuação</option>
            <option value="department">Ordenar por Departamento</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-900 border-b border-neutral-800">
              <tr className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-3">Colaborador</th>
                <th className="px-6 py-3">Cargo</th>
                <th className="px-6 py-3">Departamento</th>
                <th className="px-6 py-3 text-center">Pontuação</th>
                <th className="px-6 py-3 text-center">Tendência</th>
                <th className="px-6 py-3 text-center">Avaliações</th>
                <th className="px-6 py-3 text-center">Feedbacks</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-neutral-900/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-medium text-neutral-300">
                        {employee.avatar}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-neutral-200">{employee.name}</p>
                        <p className="text-sm text-neutral-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-neutral-200">{employee.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {employee.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                    ) : employee.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                    ) : (
                      <span className="text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-400">
                    {employee.evaluations}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-neutral-400">
                    {employee.feedbacks}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/employees/${employee.id}`}>
                      <button className="text-primary-500 hover:text-primary-400 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}






