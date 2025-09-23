'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Award,
  Target,
  MessageSquare,
  Star,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Edit,
  MoreVertical,
  Brain,
  Zap,
  Heart,
  MapPin,
  CreditCard,
  FileText,
  Users,
  Briefcase,
  GraduationCap,
  Clock,
  DollarSign,
  Shield,
  Home,
  Car,
  Baby,
  Activity,
  Download,
  Printer,
  Share2,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface EmployeeProfile {
  // Informações Pessoais
  id: string
  full_name: string
  cpf: string
  rg: string
  birth_date: string
  gender: string
  marital_status: string
  nationality: string
  
  // Contatos
  email: string
  personal_email: string
  phone: string
  mobile: string
  emergency_contact: string
  emergency_phone: string
  
  // Endereço
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zip_code: string
  
  // Informações Profissionais
  employee_id: string
  position: string
  department: string
  admission_date: string
  contract_type: string
  work_schedule: string
  salary: number
  
  // Documentação
  ctps: string
  pis_pasep: string
  voter_registration: string
  driver_license: string
  military_certificate: string
  
  // Benefícios
  health_plan: string
  dental_plan: string
  life_insurance: boolean
  meal_voucher: number
  transport_voucher: boolean
  
  // Família
  children_count: number
  dependents: Array<{
    name: string
    relationship: string
    birth_date: string
    cpf: string
  }>
  
  // Educação
  education_level: string
  institution: string
  course: string
  graduation_year: string
  certifications: string[]
  languages: string[]
  
  // Banco
  bank: string
  agency: string
  account: string
  account_type: string
  pix_key: string
  
  // Performance
  overall_score: number
  total_evaluations: number
  cha_scores: {
    conhecimento: number
    habilidade: number
    atitude: number
  }
  recent_feedbacks: any[]
  goals: any[]
  evaluations_history: any[]
  
  // Outros
  avatar_url: string
  status: 'active' | 'vacation' | 'leave' | 'inactive'
  notes: string
}

export default function EmployeeProfilePage() {
  const params = useParams()
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')
  const supabase = createClient()

  useEffect(() => {
    loadEmployeeData()
  }, [params.id])

  const loadEmployeeData = async () => {
    try {
      // Simular dados completos do colaborador
      setEmployee({
        id: params.id as string,
        full_name: 'João Carlos da Silva',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        birth_date: '15/03/1990',
        gender: 'Masculino',
        marital_status: 'Casado',
        nationality: 'Brasileiro',
        
        email: 'joao.silva@empresa.com',
        personal_email: 'joao.carlos@gmail.com',
        phone: '(11) 3456-7890',
        mobile: '(11) 98765-4321',
        emergency_contact: 'Maria Silva (Esposa)',
        emergency_phone: '(11) 98765-1234',
        
        address: 'Rua das Flores',
        number: '123',
        complement: 'Apto 45',
        neighborhood: 'Jardim Primavera',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        
        employee_id: 'EMP-2022-0156',
        position: 'Analista de Vendas Sênior',
        department: 'Vendas',
        admission_date: '15/03/2022',
        contract_type: 'CLT',
        work_schedule: '08:00 - 18:00',
        salary: 8500.00,
        
        ctps: '12345 / 001-SP',
        pis_pasep: '123.45678.90-1',
        voter_registration: '1234 5678 9012',
        driver_license: '12345678900',
        military_certificate: '123456789012',
        
        health_plan: 'Unimed Nacional Plus',
        dental_plan: 'OdontoPrev Premium',
        life_insurance: true,
        meal_voucher: 850.00,
        transport_voucher: true,
        
        children_count: 2,
        dependents: [
          {
            name: 'Pedro Silva',
            relationship: 'Filho',
            birth_date: '10/05/2015',
            cpf: '123.456.789-01'
          },
          {
            name: 'Ana Silva',
            relationship: 'Filha',
            birth_date: '20/08/2018',
            cpf: '123.456.789-02'
          }
        ],
        
        education_level: 'Superior Completo',
        institution: 'Universidade de São Paulo',
        course: 'Administração de Empresas',
        graduation_year: '2012',
        certifications: ['MBA em Vendas', 'Certificação em Negociação', 'Scrum Master'],
        languages: ['Inglês Avançado', 'Espanhol Intermediário'],
        
        bank: 'Banco do Brasil',
        agency: '1234-5',
        account: '12345-6',
        account_type: 'Conta Corrente',
        pix_key: '123.456.789-00',
        
        overall_score: 8.7,
        total_evaluations: 12,
        cha_scores: {
          conhecimento: 8.5,
          habilidade: 9.0,
          atitude: 8.6,
        },
        recent_feedbacks: [
          {
            id: 1,
            from: 'Maria Santos',
            role: 'Gerente',
            date: '10/01/2024',
            score: 9,
            comment: 'Excelente trabalho em equipe e sempre disposto a ajudar os colegas.',
          },
        ],
        goals: [
          { id: 1, title: 'Aumentar vendas em 20%', progress: 75, deadline: '31/03/2024' },
        ],
        evaluations_history: [
          { period: 'Q4 2023', score: 8.5, trend: 'up' },
        ],
        
        avatar_url: '',
        status: 'active',
        notes: 'Colaborador exemplar, sempre pontual e dedicado. Potencial para liderança.',
      })
    } catch (error) {
      console.error('Erro ao carregar dados do colaborador:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCHAIcon = (type: string) => {
    switch (type) {
      case 'conhecimento': return Brain
      case 'habilidade': return Zap
      case 'atitude': return Heart
      default: return Star
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'vacation': return 'bg-yellow-500'
      case 'leave': return 'bg-orange-500'
      case 'inactive': return 'bg-red-500'
      default: return 'bg-neutral-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-neutral-400">Carregando...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-neutral-400">Colaborador não encontrado</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="h-24 w-24 rounded-full bg-neutral-800 flex items-center justify-center text-3xl font-medium text-neutral-300">
              {employee.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-semibold text-neutral-50">{employee.full_name}</h1>
                <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(employee.status)}`}>
                  {employee.status === 'active' && 'Ativo'}
                  {employee.status === 'vacation' && 'Férias'}
                  {employee.status === 'leave' && 'Afastado'}
                  {employee.status === 'inactive' && 'Inativo'}
                </span>
              </div>
              <p className="text-neutral-400 mt-1">{employee.position}</p>
              <div className="flex items-center space-x-4 mt-3 text-sm text-neutral-500">
                <span className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  {employee.department}
                </span>
                <span className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  {employee.employee_id}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Desde {employee.admission_date}
                </span>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="btn-secondary p-2">
              <Download className="h-4 w-4" />
            </button>
            <button className="btn-secondary p-2">
              <Printer className="h-4 w-4" />
            </button>
            <button className="btn-secondary p-2">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="btn-primary">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </button>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-400">Pontuação Geral</span>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-3xl font-semibold text-neutral-50">{employee.overall_score}</p>
          <p className="text-xs text-green-500 mt-1">+0.2 vs. último período</p>
        </div>

        {Object.entries(employee.cha_scores).map(([key, value]) => {
          const Icon = getCHAIcon(key)
          return (
            <div key={key} className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-400 capitalize">{key}</span>
                <Icon className="h-4 w-4 text-primary-500" />
              </div>
              <p className="text-3xl font-semibold text-neutral-50">{value}</p>
              <div className="mt-2">
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${(value / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-800">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'personal', label: 'Dados Pessoais', icon: User },
            { id: 'professional', label: 'Profissional', icon: Briefcase },
            { id: 'documents', label: 'Documentos', icon: FileText },
            { id: 'benefits', label: 'Benefícios', icon: Shield },
            { id: 'family', label: 'Família', icon: Users },
            { id: 'education', label: 'Formação', icon: GraduationCap },
            { id: 'financial', label: 'Financeiro', icon: DollarSign },
            { id: 'performance', label: 'Desempenho', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-neutral-400 hover:text-neutral-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'personal' && (
          <>
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Pessoais */}
              <div className="card">
                <div className="p-6 border-b border-neutral-800">
                  <h2 className="text-lg font-semibold">Informações Pessoais</h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-500">Nome Completo</p>
                    <p className="text-neutral-200">{employee.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">CPF</p>
                    <p className="text-neutral-200">{employee.cpf}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">RG</p>
                    <p className="text-neutral-200">{employee.rg}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Data de Nascimento</p>
                    <p className="text-neutral-200">{employee.birth_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Gênero</p>
                    <p className="text-neutral-200">{employee.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Estado Civil</p>
                    <p className="text-neutral-200">{employee.marital_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Nacionalidade</p>
                    <p className="text-neutral-200">{employee.nationality}</p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="card">
                <div className="p-6 border-b border-neutral-800">
                  <h2 className="text-lg font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Endereço
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <p className="text-sm text-neutral-500">Logradouro</p>
                    <p className="text-neutral-200">{employee.address}, {employee.number} {employee.complement}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Bairro</p>
                    <p className="text-neutral-200">{employee.neighborhood}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">CEP</p>
                    <p className="text-neutral-200">{employee.zip_code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Cidade</p>
                    <p className="text-neutral-200">{employee.city}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Estado</p>
                    <p className="text-neutral-200">{employee.state}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contatos */}
            <div className="card">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-semibold">Contatos</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-neutral-500">E-mail Corporativo</p>
                  <p className="text-neutral-200">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">E-mail Pessoal</p>
                  <p className="text-neutral-200">{employee.personal_email}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Telefone</p>
                  <p className="text-neutral-200">{employee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Celular</p>
                  <p className="text-neutral-200">{employee.mobile}</p>
                </div>
                <div className="pt-4 border-t border-neutral-800">
                  <p className="text-sm text-neutral-500">Contato de Emergência</p>
                  <p className="text-neutral-200">{employee.emergency_contact}</p>
                  <p className="text-sm text-neutral-400">{employee.emergency_phone}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'professional' && (
          <div className="lg:col-span-3">
            <div className="card">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-semibold">Informações Profissionais</h2>
              </div>
              <div className="p-6 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-neutral-500">Matrícula</p>
                  <p className="text-neutral-200 font-medium">{employee.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Cargo</p>
                  <p className="text-neutral-200">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Departamento</p>
                  <p className="text-neutral-200">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Data de Admissão</p>
                  <p className="text-neutral-200">{employee.admission_date}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Tipo de Contrato</p>
                  <p className="text-neutral-200">{employee.contract_type}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Jornada de Trabalho</p>
                  <p className="text-neutral-200">{employee.work_schedule}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Salário Base</p>
                  <p className="text-neutral-200 font-medium text-green-400">
                    R$ {employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="lg:col-span-3">
            <div className="card">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-semibold">Documentação</h2>
              </div>
              <div className="p-6 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-neutral-500">CTPS</p>
                  <p className="text-neutral-200">{employee.ctps}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">PIS/PASEP</p>
                  <p className="text-neutral-200">{employee.pis_pasep}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Título de Eleitor</p>
                  <p className="text-neutral-200">{employee.voter_registration}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">CNH</p>
                  <p className="text-neutral-200">{employee.driver_license}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Certificado Militar</p>
                  <p className="text-neutral-200">{employee.military_certificate}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="lg:col-span-3">
            <div className="card">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-semibold">Benefícios</h2>
              </div>
              <div className="p-6 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-neutral-500">Plano de Saúde</p>
                  <p className="text-neutral-200">{employee.health_plan}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Plano Odontológico</p>
                  <p className="text-neutral-200">{employee.dental_plan}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Seguro de Vida</p>
                  <p className="text-neutral-200">{employee.life_insurance ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Vale Refeição</p>
                  <p className="text-neutral-200">R$ {employee.meal_voucher.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Vale Transporte</p>
                  <p className="text-neutral-200">{employee.transport_voucher ? 'Sim' : 'Não'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'family' && (
          <div className="lg:col-span-3">
            <div className="card">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-semibold">Dependentes</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {employee.dependents.map((dep, index) => (
                    <div key={index} className="p-4 bg-neutral-900 rounded-lg">
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500">Nome</p>
                          <p className="text-neutral-200">{dep.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Parentesco</p>
                          <p className="text-neutral-200">{dep.relationship}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">Data de Nascimento</p>
                          <p className="text-neutral-200">{dep.birth_date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500">CPF</p>
                          <p className="text-neutral-200">{dep.cpf}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 gap-6">
              <div className="card">
                <div className="p-6 border-b border-neutral-800">
                  <h2 className="text-lg font-semibold">Formação Acadêmica</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-neutral-500">Nível de Escolaridade</p>
                    <p className="text-neutral-200">{employee.education_level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Instituição</p>
                    <p className="text-neutral-200">{employee.institution}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Curso</p>
                    <p className="text-neutral-200">{employee.course}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Ano de Conclusão</p>
                    <p className="text-neutral-200">{employee.graduation_year}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="p-6 border-b border-neutral-800">
                  <h2 className="text-lg font-semibold">Certificações e Idiomas</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Certificações</p>
                    <div className="space-y-1">
                      {employee.certifications.map((cert, index) => (
                        <p key={index} className="text-neutral-200 flex items-center">
                          <Award className="h-3 w-3 mr-2 text-primary-500" />
                          {cert}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Idiomas</p>
                    <div className="space-y-1">
                      {employee.languages.map((lang, index) => (
                        <p key={index} className="text-neutral-200">{lang}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="lg:col-span-3">
            <div className="card">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-lg font-semibold">Informações Bancárias</h2>
              </div>
              <div className="p-6 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-neutral-500">Banco</p>
                  <p className="text-neutral-200">{employee.bank}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Agência</p>
                  <p className="text-neutral-200">{employee.agency}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Conta</p>
                  <p className="text-neutral-200">{employee.account}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Tipo de Conta</p>
                  <p className="text-neutral-200">{employee.account_type}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Chave PIX</p>
                  <p className="text-neutral-200">{employee.pix_key}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="lg:col-span-3">
            <div className="card">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Feedbacks Recentes</h2>
                <div className="space-y-4">
                  {employee.recent_feedbacks.map((feedback) => (
                    <div key={feedback.id} className="border-b border-neutral-800 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-neutral-200">{feedback.from}</p>
                          <p className="text-sm text-neutral-500">{feedback.role} • {feedback.date}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{feedback.score}</span>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-400">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {employee.notes && (
        <div className="card">
          <div className="p-6 border-b border-neutral-800">
            <h2 className="text-lg font-semibold">Observações</h2>
          </div>
          <div className="p-6">
            <p className="text-neutral-300">{employee.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}