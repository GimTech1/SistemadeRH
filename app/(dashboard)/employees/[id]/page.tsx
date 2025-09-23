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
import * as Dialog from '@radix-ui/react-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editTab, setEditTab] = useState('pessoal')
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({
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
  const supabase = createClient()

  useEffect(() => {
    loadEmployeeData()
  }, [params.id])

  const loadEmployeeData = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', params.id as string)
        .single()

      if (error) {
        toast.error('Erro ao carregar dados do colaborador')
        return
      }

      if (!data) {
        toast.error('Colaborador não encontrado')
        return
      }

      // Parse JSON fields
      const contacts = (data as any).contacts || {}
      const address = (data as any).address || {}
      const documents = (data as any).documents || {}
      const benefits = (data as any).benefits || {}
      const dependents = (data as any).dependents || []
      const education = (data as any).education || {}
      const bank = (data as any).bank || {}

      setEmployee({
        id: (data as any).id,
        full_name: (data as any).full_name || '',
        cpf: (data as any).cpf || '',
        rg: (data as any).rg || '',
        birth_date: (data as any).birth_date || '',
        gender: (data as any).gender || '',
        marital_status: (data as any).marital_status || '',
        nationality: (data as any).nationality || '',
        
        email: (data as any).email || '',
        personal_email: contacts.personal_email || '',
        phone: contacts.phone || '',
        mobile: contacts.cellphone || '',
        emergency_contact: contacts.emergency_contact || '',
        emergency_phone: contacts.emergency_phone || '',
        
        address: address.street || '',
        number: address.number || '',
        complement: address.complement || '',
        neighborhood: address.neighborhood || '',
        city: address.city || '',
        state: address.state || '',
        zip_code: address.zip || '',
        
        employee_id: (data as any).employee_code || '',
        position: (data as any).position || '',
        department: (data as any).department || '',
        admission_date: (data as any).admission_date || '',
        contract_type: (data as any).contract_type || '',
        work_schedule: (data as any).work_schedule || '',
        salary: (data as any).salary || 0,
        
        ctps: documents.ctps || '',
        pis_pasep: documents.pis || '',
        voter_registration: documents.voter_id || '',
        driver_license: documents.driver_license || '',
        military_certificate: documents.military_cert || '',
        
        health_plan: benefits.health_plan || '',
        dental_plan: benefits.dental_plan || '',
        life_insurance: benefits.life_insurance === 'Sim',
        meal_voucher: parseFloat(benefits.meal_voucher?.replace('R$ ', '').replace(',', '.') || '0'),
        transport_voucher: benefits.transport_voucher === 'Sim',
        
        children_count: dependents.length,
        dependents: dependents,
        
        education_level: education.level || '',
        institution: education.institution || '',
        course: education.course || '',
        graduation_year: education.graduation_year || '',
        certifications: education.certifications ? education.certifications.split(',').map((c: string) => c.trim()) : [],
        languages: education.languages ? education.languages.split(',').map((l: string) => l.trim()) : [],
        
        bank: bank.bank_name || '',
        agency: bank.agency || '',
        account: bank.account || '',
        account_type: bank.account_type || '',
        pix_key: bank.pix_key || '',
        
        overall_score: 8.7, // Placeholder - calcular baseado em avaliações
        total_evaluations: 0, // Placeholder
        cha_scores: {
          conhecimento: 8.5, // Placeholder
          habilidade: 9.0, // Placeholder
          atitude: 8.6, // Placeholder
        },
        recent_feedbacks: [], // Placeholder
        goals: [], // Placeholder
        evaluations_history: [], // Placeholder
        
        avatar_url: '',
        status: 'active',
        notes: (data as any).notes || '',
      })

      // Preencher dados de edição
      const dataAny = data as any
      setEditData({
        name: dataAny.full_name || '',
        email: dataAny.email || '',
        position: dataAny.position || '',
        department: dataAny.department || '',
        cpf: dataAny.cpf || '',
        rg: dataAny.rg || '',
        birth_date: dataAny.birth_date || '',
        gender: dataAny.gender || '',
        marital_status: dataAny.marital_status || '',
        nationality: dataAny.nationality || '',
        contacts: {
          personal_email: contacts.personal_email || '',
          phone: contacts.phone || '',
          cellphone: contacts.cellphone || '',
          emergency_contact: contacts.emergency_contact || '',
        },
        address: {
          street: address.street || '',
          neighborhood: address.neighborhood || '',
          city: address.city || '',
          zip: address.zip || '',
          state: address.state || '',
        },
        employee_code: dataAny.employee_code || '',
        admission_date: dataAny.admission_date || '',
        contract_type: dataAny.contract_type || '',
        work_schedule: dataAny.work_schedule || '',
        salary: dataAny.salary?.toString() || '',
        documents: {
          ctps: documents.ctps || '',
          pis: documents.pis || '',
          voter_id: documents.voter_id || '',
          driver_license: documents.driver_license || '',
          military_cert: documents.military_cert || '',
        },
        benefits: {
          health_plan: benefits.health_plan || '',
          dental_plan: benefits.dental_plan || '',
          life_insurance: benefits.life_insurance || '',
          meal_voucher: benefits.meal_voucher || '',
          transport_voucher: benefits.transport_voucher || '',
        },
        dependents: dependents,
        education: {
          level: education.level || '',
          institution: education.institution || '',
          course: education.course || '',
          graduation_year: education.graduation_year || '',
          certifications: education.certifications || '',
          languages: education.languages || '',
        },
        bank: {
          bank_name: bank.bank_name || '',
          agency: bank.agency || '',
          account: bank.account || '',
          account_type: bank.account_type || '',
          pix_key: bank.pix_key || '',
        },
        notes: dataAny.notes || '',
      })
    } catch (error) {
      toast.error('Erro ao carregar dados do colaborador')
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

  const handleSaveEdit = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/employees/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message || 'Falha ao salvar')
      }

      toast.success('Colaborador atualizado com sucesso')
      setIsEditOpen(false)
      loadEmployeeData() // Recarregar dados
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar colaborador')
    } finally {
      setSaving(false)
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
            <button 
              className="btn-primary"
              onClick={() => setIsEditOpen(true)}
            >
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

      {/* Edit Modal */}
      <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] card overflow-hidden">
              <div className="p-6 border-b border-neutral-800">
                <Dialog.Title className="text-lg font-semibold text-neutral-200">Editar colaborador</Dialog.Title>
                <Dialog.Description className="text-sm text-neutral-400 mt-1">
                  Edite as informações do colaborador.
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
                      onClick={() => setEditTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        editTab === tab.id
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
                {editTab === 'pessoal' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Nome completo *</Label>
                        <Input
                          id="edit-name"
                          placeholder="João Silva"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          placeholder="joao@empresa.com"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-cpf">CPF</Label>
                        <Input
                          id="edit-cpf"
                          placeholder="123.456.789-00"
                          value={editData.cpf}
                          onChange={(e) => setEditData({ ...editData, cpf: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-rg">RG</Label>
                        <Input
                          id="edit-rg"
                          placeholder="12.345.678-9"
                          value={editData.rg}
                          onChange={(e) => setEditData({ ...editData, rg: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-birth">Data de Nascimento</Label>
                        <Input
                          id="edit-birth"
                          type="date"
                          value={editData.birth_date}
                          onChange={(e) => setEditData({ ...editData, birth_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-gender">Gênero</Label>
                        <select
                          id="edit-gender"
                          value={editData.gender}
                          onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-neutral-50"
                        >
                          <option value="">Selecione</option>
                          <option value="Masculino">Masculino</option>
                          <option value="Feminino">Feminino</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-marital">Estado Civil</Label>
                        <select
                          id="edit-marital"
                          value={editData.marital_status}
                          onChange={(e) => setEditData({ ...editData, marital_status: e.target.value })}
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
                        <Label htmlFor="edit-nationality">Nacionalidade</Label>
                        <Input
                          id="edit-nationality"
                          placeholder="Brasileiro"
                          value={editData.nationality}
                          onChange={(e) => setEditData({ ...editData, nationality: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-neutral-300">Contatos</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-personal-email">Email Pessoal</Label>
                          <Input
                            id="edit-personal-email"
                            type="email"
                            placeholder="joao@gmail.com"
                            value={editData.contacts.personal_email}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              contacts: { ...editData.contacts, personal_email: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-phone">Telefone</Label>
                          <Input
                            id="edit-phone"
                            placeholder="(11) 3456-7890"
                            value={editData.contacts.phone}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              contacts: { ...editData.contacts, phone: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-cellphone">Celular</Label>
                          <Input
                            id="edit-cellphone"
                            placeholder="(11) 98765-4321"
                            value={editData.contacts.cellphone}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              contacts: { ...editData.contacts, cellphone: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-emergency">Contato de Emergência</Label>
                          <Input
                            id="edit-emergency"
                            placeholder="Maria Silva (Esposa) - (11) 98765-1234"
                            value={editData.contacts.emergency_contact}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              contacts: { ...editData.contacts, emergency_contact: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-neutral-300">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-street">Logradouro</Label>
                          <Input
                            id="edit-street"
                            placeholder="Rua das Flores, 123 Apto 45"
                            value={editData.address.street}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              address: { ...editData.address, street: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-neighborhood">Bairro</Label>
                          <Input
                            id="edit-neighborhood"
                            placeholder="Jardim Primavera"
                            value={editData.address.neighborhood}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              address: { ...editData.address, neighborhood: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-city">Cidade</Label>
                          <Input
                            id="edit-city"
                            placeholder="São Paulo"
                            value={editData.address.city}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              address: { ...editData.address, city: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-zip">CEP</Label>
                          <Input
                            id="edit-zip"
                            placeholder="01234-567"
                            value={editData.address.zip}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              address: { ...editData.address, zip: e.target.value }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="edit-state">Estado</Label>
                          <Input
                            id="edit-state"
                            placeholder="SP"
                            value={editData.address.state}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              address: { ...editData.address, state: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {editTab === 'profissional' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-position">Cargo *</Label>
                        <Input
                          id="edit-position"
                          placeholder="Analista de Vendas Sênior"
                          value={editData.position}
                          onChange={(e) => setEditData({ ...editData, position: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-dept">Departamento</Label>
                        <Input
                          id="edit-dept"
                          placeholder="Vendas"
                          value={editData.department}
                          onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-code">Matrícula</Label>
                        <Input
                          id="edit-code"
                          placeholder="EMP-2022-0156"
                          value={editData.employee_code}
                          onChange={(e) => setEditData({ ...editData, employee_code: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-admission">Data de Admissão</Label>
                        <Input
                          id="edit-admission"
                          type="date"
                          value={editData.admission_date}
                          onChange={(e) => setEditData({ ...editData, admission_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-contract">Tipo de Contrato</Label>
                        <select
                          id="edit-contract"
                          value={editData.contract_type}
                          onChange={(e) => setEditData({ ...editData, contract_type: e.target.value })}
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
                        <Label htmlFor="edit-schedule">Jornada de Trabalho</Label>
                        <Input
                          id="edit-schedule"
                          placeholder="08:00 - 18:00"
                          value={editData.work_schedule}
                          onChange={(e) => setEditData({ ...editData, work_schedule: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-salary">Salário Base</Label>
                        <Input
                          id="edit-salary"
                          type="number"
                          placeholder="8500.00"
                          value={editData.salary}
                          onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Outras abas podem ser adicionadas aqui seguindo o mesmo padrão */}
              </div>
              
              <div className="p-6 border-t border-neutral-800 flex items-center justify-end gap-2">
                <Dialog.Close asChild>
                  <button className="btn-ghost">Cancelar</button>
                </Dialog.Close>
                <button
                  className="btn-primary"
                  disabled={saving}
                  onClick={handleSaveEdit}
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}