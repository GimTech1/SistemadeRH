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
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const [isNewOpen, setIsNewOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    // Básico
    name: '',
    email: '',
    position: '',
    department: '',
    // Pessoal
    cpf: '',
    rg: '',
    birth_date: '',
    gender: '',
    marital_status: '',
    nationality: '',
    contacts: { personal_email: '', phone: '', cellphone: '', emergency_contact: '' },
    address: { street: '', neighborhood: '', city: '', zip: '', state: '' },
    // Profissional
    employee_code: '',
    admission_date: '',
    contract_type: '',
    work_schedule: '',
    salary: '',
    // Documentos
    documents: { ctps: '', pis: '', voter_id: '', driver_license: '', military_cert: '' },
    // Benefícios
    benefits: { health_plan: '', dental_plan: '', life_insurance: '', meal_voucher: '', transport_voucher: '' },
    // Dependentes
    dependents: [] as Array<{ name: string; relationship: string; birth_date: string; cpf: string }>,
    // Formação
    education: { level: '', institution: '', course: '', graduation_year: '', certifications: '', languages: '' },
    // Bancário
    bank: { bank_name: '', agency: '', account: '', account_type: '', pix_key: '' },
    // Observações
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('pessoal')

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
              <div className="w-full max-w-4xl max-h-[90vh] card overflow-hidden">
                <div className="p-6 border-b border-neutral-800">
                  <Dialog.Title className="text-lg font-semibold text-neutral-200">Adicionar colaborador</Dialog.Title>
                  <Dialog.Description className="text-sm text-neutral-400 mt-1">
                    Preencha todas as informações do novo colaborador.
                  </Dialog.Description>
                </div>
                
                {/* Tabs */}
                <div className="border-b border-neutral-800">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'pessoal', label: 'Pessoal' },
                      { id: 'profissional', label: 'Profissional' },
                      { id: 'documentos', label: 'Documentos' },
                      { id: 'beneficios', label: 'Benefícios' },
                      { id: 'dependentes', label: 'Dependentes' },
                      { id: 'formacao', label: 'Formação' },
                      { id: 'bancario', label: 'Bancário' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-400'
                            : 'border-transparent text-neutral-400 hover:text-neutral-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                  {activeTab === 'pessoal' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-name">Nome completo *</Label>
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
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-cpf">CPF</Label>
                          <Input
                            id="emp-cpf"
                            placeholder="123.456.789-00"
                            value={newEmployee.cpf}
                            onChange={(e) => setNewEmployee({ ...newEmployee, cpf: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-rg">RG</Label>
                          <Input
                            id="emp-rg"
                            placeholder="12.345.678-9"
                            value={newEmployee.rg}
                            onChange={(e) => setNewEmployee({ ...newEmployee, rg: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-birth">Data de Nascimento</Label>
                          <Input
                            id="emp-birth"
                            type="date"
                            value={newEmployee.birth_date}
                            onChange={(e) => setNewEmployee({ ...newEmployee, birth_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-gender">Gênero</Label>
                          <select
                            id="emp-gender"
                            value={newEmployee.gender}
                            onChange={(e) => setNewEmployee({ ...newEmployee, gender: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                          >
                            <option value="">Selecione</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-marital">Estado Civil</Label>
                          <select
                            id="emp-marital"
                            value={newEmployee.marital_status}
                            onChange={(e) => setNewEmployee({ ...newEmployee, marital_status: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                          >
                            <option value="">Selecione</option>
                            <option value="Solteiro">Solteiro</option>
                            <option value="Casado">Casado</option>
                            <option value="Divorciado">Divorciado</option>
                            <option value="Viúvo">Viúvo</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-nationality">Nacionalidade</Label>
                          <Input
                            id="emp-nationality"
                            placeholder="Brasileiro"
                            value={newEmployee.nationality}
                            onChange={(e) => setNewEmployee({ ...newEmployee, nationality: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-neutral-300">Contatos</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="emp-personal-email">Email Pessoal</Label>
                            <Input
                              id="emp-personal-email"
                              type="email"
                              placeholder="joao@gmail.com"
                              value={newEmployee.contacts.personal_email}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                contacts: { ...newEmployee.contacts, personal_email: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-phone">Telefone</Label>
                            <Input
                              id="emp-phone"
                              placeholder="(11) 3456-7890"
                              value={newEmployee.contacts.phone}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                contacts: { ...newEmployee.contacts, phone: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-cellphone">Celular</Label>
                            <Input
                              id="emp-cellphone"
                              placeholder="(11) 98765-4321"
                              value={newEmployee.contacts.cellphone}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                contacts: { ...newEmployee.contacts, cellphone: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-emergency">Contato de Emergência</Label>
                            <Input
                              id="emp-emergency"
                              placeholder="Maria Silva (Esposa) - (11) 98765-1234"
                              value={newEmployee.contacts.emergency_contact}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                contacts: { ...newEmployee.contacts, emergency_contact: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-neutral-300">Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="emp-street">Logradouro</Label>
                            <Input
                              id="emp-street"
                              placeholder="Rua das Flores, 123 Apto 45"
                              value={newEmployee.address.street}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                address: { ...newEmployee.address, street: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-neighborhood">Bairro</Label>
                            <Input
                              id="emp-neighborhood"
                              placeholder="Jardim Primavera"
                              value={newEmployee.address.neighborhood}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                address: { ...newEmployee.address, neighborhood: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-city">Cidade</Label>
                            <Input
                              id="emp-city"
                              placeholder="São Paulo"
                              value={newEmployee.address.city}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                address: { ...newEmployee.address, city: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-zip">CEP</Label>
                            <Input
                              id="emp-zip"
                              placeholder="01234-567"
                              value={newEmployee.address.zip}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                address: { ...newEmployee.address, zip: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-state">Estado</Label>
                            <Input
                              id="emp-state"
                              placeholder="SP"
                              value={newEmployee.address.state}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                address: { ...newEmployee.address, state: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'profissional' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-position">Cargo *</Label>
                          <Input
                            id="emp-position"
                            placeholder="Analista de Vendas Sênior"
                            value={newEmployee.position}
                            onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-dept">Departamento</Label>
                          <Input
                            id="emp-dept"
                            placeholder="Vendas"
                            value={newEmployee.department}
                            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-code">Matrícula</Label>
                          <Input
                            id="emp-code"
                            placeholder="EMP-2022-0156"
                            value={newEmployee.employee_code}
                            onChange={(e) => setNewEmployee({ ...newEmployee, employee_code: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-admission">Data de Admissão</Label>
                          <Input
                            id="emp-admission"
                            type="date"
                            value={newEmployee.admission_date}
                            onChange={(e) => setNewEmployee({ ...newEmployee, admission_date: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-contract">Tipo de Contrato</Label>
                          <select
                            id="emp-contract"
                            value={newEmployee.contract_type}
                            onChange={(e) => setNewEmployee({ ...newEmployee, contract_type: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                          >
                            <option value="">Selecione</option>
                            <option value="CLT">CLT</option>
                            <option value="PJ">PJ</option>
                            <option value="Estagiário">Estagiário</option>
                            <option value="Terceirizado">Terceirizado</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-schedule">Jornada de Trabalho</Label>
                          <Input
                            id="emp-schedule"
                            placeholder="08:00 - 18:00"
                            value={newEmployee.work_schedule}
                            onChange={(e) => setNewEmployee({ ...newEmployee, work_schedule: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-salary">Salário Base</Label>
                          <Input
                            id="emp-salary"
                            type="number"
                            placeholder="8500.00"
                            value={newEmployee.salary}
                            onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'documentos' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-ctps">CTPS</Label>
                          <Input
                            id="emp-ctps"
                            placeholder="12345 / 001-SP"
                            value={newEmployee.documents.ctps}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              documents: { ...newEmployee.documents, ctps: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-pis">PIS/PASEP</Label>
                          <Input
                            id="emp-pis"
                            placeholder="123.45678.90-1"
                            value={newEmployee.documents.pis}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              documents: { ...newEmployee.documents, pis: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-voter">Título de Eleitor</Label>
                          <Input
                            id="emp-voter"
                            placeholder="1234 5678 9012"
                            value={newEmployee.documents.voter_id}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              documents: { ...newEmployee.documents, voter_id: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-license">CNH</Label>
                          <Input
                            id="emp-license"
                            placeholder="12345678900"
                            value={newEmployee.documents.driver_license}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              documents: { ...newEmployee.documents, driver_license: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-military">Certificado Militar</Label>
                          <Input
                            id="emp-military"
                            placeholder="123456789012"
                            value={newEmployee.documents.military_cert}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              documents: { ...newEmployee.documents, military_cert: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'beneficios' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-health">Plano de Saúde</Label>
                          <Input
                            id="emp-health"
                            placeholder="Unimed Nacional Plus"
                            value={newEmployee.benefits.health_plan}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              benefits: { ...newEmployee.benefits, health_plan: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-dental">Plano Odontológico</Label>
                          <Input
                            id="emp-dental"
                            placeholder="OdontoPrev Premium"
                            value={newEmployee.benefits.dental_plan}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              benefits: { ...newEmployee.benefits, dental_plan: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-life">Seguro de Vida</Label>
                          <select
                            id="emp-life"
                            value={newEmployee.benefits.life_insurance}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              benefits: { ...newEmployee.benefits, life_insurance: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                          >
                            <option value="">Selecione</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-meal">Vale Refeição</Label>
                          <Input
                            id="emp-meal"
                            placeholder="R$ 850.00"
                            value={newEmployee.benefits.meal_voucher}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              benefits: { ...newEmployee.benefits, meal_voucher: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-transport">Vale Transporte</Label>
                          <select
                            id="emp-transport"
                            value={newEmployee.benefits.transport_voucher}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              benefits: { ...newEmployee.benefits, transport_voucher: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                          >
                            <option value="">Selecione</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'dependentes' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-neutral-300">Dependentes</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const newDependent = { name: '', relationship: '', birth_date: '', cpf: '' }
                            setNewEmployee({ 
                              ...newEmployee, 
                              dependents: [...newEmployee.dependents, newDependent]
                            })
                          }}
                          className="text-sm text-primary-400 hover:text-primary-300"
                        >
                          + Adicionar Dependente
                        </button>
                      </div>
                      {newEmployee.dependents.map((dependent, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-neutral-800 rounded-lg">
                          <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                              placeholder="Pedro Silva"
                              value={dependent.name}
                              onChange={(e) => {
                                const updated = [...newEmployee.dependents]
                                updated[index] = { ...dependent, name: e.target.value }
                                setNewEmployee({ ...newEmployee, dependents: updated })
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Parentesco</Label>
                            <select
                              value={dependent.relationship}
                              onChange={(e) => {
                                const updated = [...newEmployee.dependents]
                                updated[index] = { ...dependent, relationship: e.target.value }
                                setNewEmployee({ ...newEmployee, dependents: updated })
                              }}
                              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                            >
                              <option value="">Selecione</option>
                              <option value="Filho">Filho</option>
                              <option value="Filha">Filha</option>
                              <option value="Cônjuge">Cônjuge</option>
                              <option value="Pai">Pai</option>
                              <option value="Mãe">Mãe</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Data de Nascimento</Label>
                            <Input
                              type="date"
                              value={dependent.birth_date}
                              onChange={(e) => {
                                const updated = [...newEmployee.dependents]
                                updated[index] = { ...dependent, birth_date: e.target.value }
                                setNewEmployee({ ...newEmployee, dependents: updated })
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CPF</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="123.456.789-01"
                                value={dependent.cpf}
                                onChange={(e) => {
                                  const updated = [...newEmployee.dependents]
                                  updated[index] = { ...dependent, cpf: e.target.value }
                                  setNewEmployee({ ...newEmployee, dependents: updated })
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = newEmployee.dependents.filter((_, i) => i !== index)
                                  setNewEmployee({ ...newEmployee, dependents: updated })
                                }}
                                className="px-3 py-2 text-red-400 hover:text-red-300"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'formacao' && (
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-neutral-300">Formação Acadêmica</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="emp-level">Nível de Escolaridade</Label>
                            <select
                              id="emp-level"
                              value={newEmployee.education.level}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                education: { ...newEmployee.education, level: e.target.value }
                              })}
                              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                            >
                              <option value="">Selecione</option>
                              <option value="Ensino Fundamental">Ensino Fundamental</option>
                              <option value="Ensino Médio">Ensino Médio</option>
                              <option value="Superior Incompleto">Superior Incompleto</option>
                              <option value="Superior Completo">Superior Completo</option>
                              <option value="Pós-graduação">Pós-graduação</option>
                              <option value="Mestrado">Mestrado</option>
                              <option value="Doutorado">Doutorado</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-institution">Instituição</Label>
                            <Input
                              id="emp-institution"
                              placeholder="Universidade de São Paulo"
                              value={newEmployee.education.institution}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                education: { ...newEmployee.education, institution: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-course">Curso</Label>
                            <Input
                              id="emp-course"
                              placeholder="Administração de Empresas"
                              value={newEmployee.education.course}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                education: { ...newEmployee.education, course: e.target.value }
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emp-graduation">Ano de Conclusão</Label>
                            <Input
                              id="emp-graduation"
                              placeholder="2012"
                              value={newEmployee.education.graduation_year}
                              onChange={(e) => setNewEmployee({ 
                                ...newEmployee, 
                                education: { ...newEmployee.education, graduation_year: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-neutral-300">Certificações e Idiomas</h4>
                        <div className="space-y-2">
                          <Label htmlFor="emp-certifications">Certificações</Label>
                          <textarea
                            id="emp-certifications"
                            placeholder="MBA em Vendas, Certificação em Negociação, Scrum Master"
                            value={newEmployee.education.certifications}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              education: { ...newEmployee.education, certifications: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50 min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-languages">Idiomas</Label>
                          <textarea
                            id="emp-languages"
                            placeholder="Inglês Avançado, Espanhol Intermediário"
                            value={newEmployee.education.languages}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              education: { ...newEmployee.education, languages: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50 min-h-[80px]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'bancario' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="emp-bank">Banco</Label>
                          <Input
                            id="emp-bank"
                            placeholder="Banco do Brasil"
                            value={newEmployee.bank.bank_name}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              bank: { ...newEmployee.bank, bank_name: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-agency">Agência</Label>
                          <Input
                            id="emp-agency"
                            placeholder="1234-5"
                            value={newEmployee.bank.agency}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              bank: { ...newEmployee.bank, agency: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-account">Conta</Label>
                          <Input
                            id="emp-account"
                            placeholder="12345-6"
                            value={newEmployee.bank.account}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              bank: { ...newEmployee.bank, account: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-account-type">Tipo de Conta</Label>
                          <select
                            id="emp-account-type"
                            value={newEmployee.bank.account_type}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              bank: { ...newEmployee.bank, account_type: e.target.value }
                            })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                          >
                            <option value="">Selecione</option>
                            <option value="Conta Corrente">Conta Corrente</option>
                            <option value="Conta Poupança">Conta Poupança</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emp-pix">Chave PIX</Label>
                          <Input
                            id="emp-pix"
                            placeholder="123.456.789-00"
                            value={newEmployee.bank.pix_key}
                            onChange={(e) => setNewEmployee({ 
                              ...newEmployee, 
                              bank: { ...newEmployee.bank, pix_key: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-neutral-800 flex items-center justify-end gap-2">
                  <Dialog.Close asChild>
                    <button className="btn-ghost">Cancelar</button>
                  </Dialog.Close>
                  <button
                    className="btn-primary"
                    disabled={saving}
                    onClick={async () => {
                      if (!newEmployee.name) {
                        toast.error('Preencha o nome do colaborador')
                        return
                      }
                      try {
                        setSaving(true)
                        const res = await fetch('/api/employees', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(newEmployee),
                        })
                        const json = await res.json()
                        if (!res.ok) {
                          throw new Error(json.message || 'Falha ao salvar')
                        }

                        const created = json.employee as { id: string; full_name: string; email: string; position: string; department?: string }
                        setEmployees(prev => [
                          ...prev,
                          {
                            id: created.id,
                            name: created.full_name,
                            email: created.email,
                            position: created.position,
                            department: created.department || '—',
                            score: 0,
                            trend: 'stable',
                            evaluations: 0,
                            feedbacks: 0,
                            avatar: (created.full_name || created.email)
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase(),
                          },
                        ])
                        toast.success('Colaborador criado com sucesso')
                        setNewEmployee({
                          name: '',
                          email: '',
                          position: '',
                          department: '',
                          cpf: '',
                          rg: '',
                          birth_date: '',
                          gender: '',
                          marital_status: '',
                          nationality: '',
                          contacts: { personal_email: '', phone: '', cellphone: '', emergency_contact: '' },
                          address: { street: '', neighborhood: '', city: '', zip: '', state: '' },
                          employee_code: '',
                          admission_date: '',
                          contract_type: '',
                          work_schedule: '',
                          salary: '',
                          documents: { ctps: '', pis: '', voter_id: '', driver_license: '', military_cert: '' },
                          benefits: { health_plan: '', dental_plan: '', life_insurance: '', meal_voucher: '', transport_voucher: '' },
                          dependents: [],
                          education: { level: '', institution: '', course: '', graduation_year: '', certifications: '', languages: '' },
                          bank: { bank_name: '', agency: '', account: '', account_type: '', pix_key: '' },
                          notes: '',
                        })
                        setActiveTab('pessoal')
                        setIsNewOpen(false)
                      } catch (err: any) {
                        toast.error(err.message || 'Erro ao salvar colaborador')
                      } finally {
                        setSaving(false)
                      }
                    }}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
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






