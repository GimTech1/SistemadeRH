'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { validateCPF, formatCPF, validateRG, formatRG, searchAddressByCEP, formatCEP } from '@/lib/validations'
import {
  User,
  Mail,
  Building,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  Users,
  Banknote,
  Save,
  ArrowLeft,
  UserPlus,
} from 'lucide-react'
import toast from 'react-hot-toast'
interface FormData {
  name: string
  email: string
  position: string
  department: string
  cpf: string
  rg: string
  birth_date: string
  gender: string
  marital_status: string
  nationality: string
  phone: string
  emergency_contact: string
  emergency_phone: string  
  address: string
  neighborhood: string
  city: string
  state: string
  zip_code: string 
  employee_code: string
  admission_date: string
  contract_type: string
  work_schedule: string
  salary: string
  rg_photo: string
  cpf_photo: string
  ctps_photo: string
  diploma_photo: string 
  vale_refeicao: string
  vale_transporte: string
  plano_saude: boolean
  plano_dental: boolean
  dependent_name_1: string
  dependent_relationship_1: string
  dependent_birth_date_1: string
  dependent_name_2: string
  dependent_relationship_2: string
  dependent_birth_date_2: string
  dependent_name_3: string
  dependent_relationship_3: string
  dependent_birth_date_3: string
  education_level: string
  course_name: string
  institution_name: string
  graduation_year: string
  bank_name: string
  bank_agency: string
  bank_account: string
  account_type: string
  pix_key: string
  notes: string
  is_active?: boolean
}

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const supabase = createClient()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    cpf?: string;
    rg?: string;
    cep?: string;
  }>({})
  const [isValidatingCEP, setIsValidatingCEP] = useState(false)
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; description?: string }>>([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const rgPhotoRef = useRef<HTMLInputElement>(null)
  const cpfPhotoRef = useRef<HTMLInputElement>(null)
  const ctpsPhotoRef = useRef<HTMLInputElement>(null)
  const diplomaPhotoRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<FormData>({
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
    phone: '',
    emergency_contact: '',
    emergency_phone: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    employee_code: '',
    admission_date: '',
    contract_type: '',
    work_schedule: '',
    salary: '',
    rg_photo: '',
    cpf_photo: '',
    ctps_photo: '',
    diploma_photo: '',
    vale_refeicao: '',
    vale_transporte: '',
    plano_saude: false,
    plano_dental: false,
    dependent_name_1: '',
    dependent_relationship_1: '',
    dependent_birth_date_1: '',
    dependent_name_2: '',
    dependent_relationship_2: '',
    dependent_birth_date_2: '',
    dependent_name_3: '',
    dependent_relationship_3: '',
    dependent_birth_date_3: '',
    education_level: '',
    course_name: '',
    institution_name: '',
    graduation_year: '',
    bank_name: '',
    bank_agency: '',
    bank_account: '',
    account_type: '',
    pix_key: '',
    notes: '',
    is_active: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedValue = formatCPF(value)
    
    setFormData(prev => ({
      ...prev,
      cpf: formattedValue
    }))

    if (value.replace(/\D/g, '').length === 11) {
      const validation = validateCPF(value)
      setValidationErrors(prev => ({
        ...prev,
        cpf: validation.isValid ? undefined : validation.error
      }))
    } else {
      setValidationErrors(prev => ({
        ...prev,
        cpf: undefined
      }))
    }
  }

  const handleRGChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedValue = formatRG(value)
    setFormData(prev => ({
      ...prev,
      rg: formattedValue
    }))
    
    if (value.replace(/[^\dA-Za-z]/g, '').length >= 7) {
      const validation = validateRG(value)
      setValidationErrors(prev => ({
        ...prev,
        rg: validation.isValid ? undefined : validation.error
      }))
    } else {
      setValidationErrors(prev => ({
        ...prev,
        rg: undefined
      }))
    }
  }
  
  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedValue = formatCEP(value)
    setFormData(prev => ({
      ...prev,
      zip_code: formattedValue
    }))

    if (value.replace(/\D/g, '').length === 8) {
      setIsValidatingCEP(true)
      setValidationErrors(prev => ({
        ...prev,
        cep: undefined
      }))
      try {
        const result = await searchAddressByCEP(value)
        if (result.success && result.data) {
          setFormData(prev => ({
            ...prev,
            address: result.data!.logradouro,
            neighborhood: result.data!.bairro,
            city: result.data!.localidade,
            state: result.data!.uf
          }))
        } else {
          setValidationErrors(prev => ({
            ...prev,
            cep: result.error
          }))
        }
      } catch (error) {
        setValidationErrors(prev => ({
          ...prev,
          cep: 'Erro ao buscar CEP'
        }))
      } finally {
        setIsValidatingCEP(false)
      }
    } else {
      setValidationErrors(prev => ({
        ...prev,
        cep: undefined
      }))
    }
  }
  
  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true)
      const response = await fetch('/api/departments')
      const data = await response.json()
      if (response.ok) {
        setDepartments(data.departments || [])
      } else {
        toast.error('Erro ao carregar departamentos')
      }
    } catch (error) {
      toast.error('Erro ao carregar departamentos')
    } finally {
      setLoadingDepartments(false)
    }
  }
  
  useEffect(() => {
    fetchDepartments()
  }, [])

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('employee-documents')
      .upload(path, file)
    
    if (error) {
      throw error
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('employee-documents')
      .getPublicUrl(path)
    return publicUrl
  }

  const startCamera = async () => {
    try {
      setShowCamera(true)
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
      const constraints: MediaStreamConstraints = { video: { facingMode: 'user' }, audio: false }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setMediaStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast.error('Erro ao acessar a câmera')
      setShowCamera(false)
    }
  }

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
    setShowCamera(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    setCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `avatar-${Date.now()}.png`, { type: 'image/png' })
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(blob))
        stopCamera()
      }
      setCapturing(false)
    }, 'image/png')
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep < steps.length) {
      return
    }
    if (!formData.name) {
      toast.error('Nome é obrigatório')
      return
    }
    setLoading(true)
    try {
      let avatarUrl = null
      let rgPhotoUrl = null
      let cpfPhotoUrl = null
      let ctpsPhotoUrl = null
      let diplomaPhotoUrl = null
      if (avatarFile) {
        const fileName = `avatar-${Date.now()}-${avatarFile.name}`
        avatarUrl = await uploadFile(avatarFile, fileName)
      }
      if (rgPhotoRef.current?.files?.[0]) {
        const file = rgPhotoRef.current.files[0]
        const fileName = `rg-${Date.now()}-${file.name}`
        rgPhotoUrl = await uploadFile(file, fileName)
      }
      if (cpfPhotoRef.current?.files?.[0]) {
        const file = cpfPhotoRef.current.files[0]
        const fileName = `cpf-${Date.now()}-${file.name}`
        cpfPhotoUrl = await uploadFile(file, fileName)
      }
      if (ctpsPhotoRef.current?.files?.[0]) {
        const file = ctpsPhotoRef.current.files[0]
        const fileName = `ctps-${Date.now()}-${file.name}`
        ctpsPhotoUrl = await uploadFile(file, fileName)
      }
      if (diplomaPhotoRef.current?.files?.[0]) {
        const file = diplomaPhotoRef.current.files[0]
        const fileName = `diploma-${Date.now()}-${file.name}`
        diplomaPhotoUrl = await uploadFile(file, fileName)
      }

      const { data, error } = await (supabase as any)
        .from('employees')
        .insert({
          full_name: formData.name,
          email: formData.email || null,
          position: formData.position || null,
          department: formData.department || null,
          is_active: typeof formData.is_active === 'boolean' ? formData.is_active : true,
          avatar_url: avatarUrl,
          cpf: formData.cpf || null,
          rg: formData.rg || null,
          birth_date: formData.birth_date || null,
          gender: formData.gender || null,
          marital_status: formData.marital_status || null,
          nationality: formData.nationality || null,
          phone: formData.phone || null,
          emergency_contact: formData.emergency_contact || null,
          emergency_phone: formData.emergency_phone || null,
          address: formData.address || null,
          neighborhood: formData.neighborhood || null,
          city: formData.city || null,
          state: formData.state || null,
          zip_code: formData.zip_code || null,
          employee_code: formData.employee_code || null,
          admission_date: formData.admission_date || null,
          contract_type: formData.contract_type || null,
          work_schedule: formData.work_schedule || null,
          salary: formData.salary ? parseFloat(formData.salary) : null,
          rg_photo: rgPhotoUrl,
          cpf_photo: cpfPhotoUrl,
          ctps_photo: ctpsPhotoUrl,
          diploma_photo: diplomaPhotoUrl,
          vale_refeicao: formData.vale_refeicao ? parseFloat(formData.vale_refeicao) : null,
          vale_transporte: formData.vale_transporte ? parseFloat(formData.vale_transporte) : null,
          plano_saude: formData.plano_saude,
          plano_dental: formData.plano_dental,
          dependent_name_1: formData.dependent_name_1 || null,
          dependent_relationship_1: formData.dependent_relationship_1 || null,
          dependent_birth_date_1: formData.dependent_birth_date_1 || null,
          dependent_name_2: formData.dependent_name_2 || null,
          dependent_relationship_2: formData.dependent_relationship_2 || null,
          dependent_birth_date_2: formData.dependent_birth_date_2 || null,
          dependent_name_3: formData.dependent_name_3 || null,
          dependent_relationship_3: formData.dependent_relationship_3 || null,
          dependent_birth_date_3: formData.dependent_birth_date_3 || null,
          education_level: formData.education_level || null,
          course_name: formData.course_name || null,
          institution_name: formData.institution_name || null,
          graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
          bank_name: formData.bank_name || null,
          bank_agency: formData.bank_agency || null,
          bank_account: formData.bank_account || null,
          account_type: formData.account_type || null,
          pix_key: formData.pix_key || null,
          notes: formData.notes || null,
        })
        .select('*')
        .single()

      if (error) {
        throw error
      }
      toast.success('Colaborador adicionado com sucesso!')
      router.push('/employees')
    } catch (error: any) {
      toast.error('Erro ao adicionar colaborador: ' + (error.message || 'Erro inesperado'))
    } finally {
      setLoading(false)
    }
  }
  const steps = [
    { id: 1, title: 'Informações Básicas', icon: User },
    { id: 2, title: 'Contatos e Endereço', icon: MapPin },
    { id: 3, title: 'Dados Profissionais', icon: Building },
    { id: 4, title: 'Documentos e Benefícios', icon: FileText },
  ]

  const nextStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">
              Adicionar Novo Colaborador
            </h1>
            <p className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">
              Preencha as informações do novo colaborador
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-4 sm:p-6">
        {/* Indicador de scroll para mobile */}
        <div className="sm:hidden px-2 py-1 -mt-2 -mb-1 text-center text-xs text-oxford-blue-500">
          ← Deslize para ver as etapas →
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center justify-between min-w-[560px] sm:min-w-0">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 hover:scale-105 cursor-pointer ${
                    isActive 
                      ? 'border-yinmn-blue-500 bg-yinmn-blue-500 text-white' 
                      : isCompleted
                      ? 'border-green-500 bg-green-500 text-white hover:bg-green-600'
                      : 'border-platinum-300 bg-white text-oxford-blue-400 hover:border-yinmn-blue-300 hover:bg-yinmn-blue-50'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className="ml-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                >
                  <p className={`text-xs sm:text-sm font-roboto font-medium ${
                    isActive ? 'text-yinmn-blue-600' : isCompleted ? 'text-green-600' : 'text-oxford-blue-400'
                  }`}>
                    {step.title}
                  </p>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-10 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-platinum-300'
                  }`} />
                )}
              </div>
            )
          })}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-4 sm:p-6">
            <h2 className="text-lg font-roboto font-medium text-rich-black-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Básicas
            </h2>
            <div className="mb-6 p-4 bg-platinum-50 rounded-lg border border-platinum-200">
              <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-3">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full overflow-hidden border border-platinum-300 bg-platinum-100 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-platinum-500 text-sm">Sem foto</span>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="block mb-2 text-sm text-rich-black-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yinmn-blue-500 file:text-white hover:file:bg-yinmn-blue-600"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null
                      setAvatarFile(f)
                      if (f) setAvatarPreview(URL.createObjectURL(f))
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1 text-xs bg-white border border-platinum-300 rounded-lg text-rich-black-900 hover:bg-platinum-50 transition-colors"
                    >
                      Usar câmera
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}
                      className="px-3 py-1 text-xs bg-white border border-platinum-300 rounded-lg text-rich-black-900 hover:bg-platinum-50 transition-colors"
                    >
                      Limpar
                    </button>
                  </div>
                  {showCamera && (
                    <div className="mt-4 flex items-center gap-4">
                      <video
                        ref={videoRef}
                        className="rounded-xl border border-slate-200 w-64 h-48 bg-black"
                        autoPlay
                        playsInline
                        muted
                      />
                      <div className="flex flex-col gap-2">
                        <Button variant="primary" className="!bg-[#1B263B] flex items-center justify-center gap-2" onClick={capturePhoto} disabled={capturing}>
                          {capturing && (
                            <span className="inline-block h-4 w-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />
                          )}
                          {capturing ? 'Capturando...' : 'Capturar'}
                        </Button>
                        <Button variant="ghost" onClick={stopCamera}>Fechar</Button>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="Digite o nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  <Building className="h-4 w-4 inline mr-2" />
                  Cargo
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="Ex: Desenvolvedor, Analista, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Departamento
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={loadingDepartments}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">
                    {loadingDepartments ? 'Carregando departamentos...' : 'Selecione um departamento'}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  maxLength={14}
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent ${
                    validationErrors.cpf ? 'border-red-500' : 'border-platinum-300'
                  }`}
                  placeholder="000.000.000-00"
                />
                {validationErrors.cpf && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.cpf}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  RG
                </label>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleRGChange}
                  maxLength={12}
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent ${
                    validationErrors.rg ? 'border-red-500' : 'border-platinum-300'
                  }`}
                  placeholder="00.000.000-0"
                />
                {validationErrors.rg && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.rg}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Gênero
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="nao_informar">Não informar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Estado Civil
                </label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">Selecione</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="uniao_estavel">União Estável</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Nacionalidade
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="Ex: Brasileira"
                />
              </div>
            </div>
          </div>
        )}

        
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-4 sm:p-6">
            <h2 className="text-lg font-roboto font-medium text-rich-black-900 mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Contatos e Endereço
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-roboto font-medium text-rich-black-900 mb-4">Contatos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Contato de Emergência
                    </label>
                    <input
                      type="text"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="Nome do contato"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Telefone de Emergência
                    </label>
                    <input
                      type="tel"
                      name="emergency_phone"
                      value={formData.emergency_phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-roboto font-medium text-rich-black-900 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      CEP
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleCEPChange}
                        maxLength={9}
                        className={`w-full px-4 py-3 bg-white border rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent ${
                          validationErrors.cep ? 'border-red-500' : 'border-platinum-300'
                        }`}
                        placeholder="00000-000"
                      />
                      {isValidatingCEP && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-4 h-4 border-2 border-yinmn-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    {validationErrors.cep && (
                      <p className="text-red-500 text-sm mt-1">{validationErrors.cep}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="UF"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Endereço Completo
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="Rua, número"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Bairro
                    </label>
                    <input
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-4 sm:p-6">
            <h2 className="text-lg font-roboto font-medium text-rich-black-900 mb-6 flex items-center gap-2">
              <Building className="h-5 w-5" />
              Dados Profissionais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={!!formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="h-4 w-4"
                />
                <label htmlFor="is_active" className="text-sm font-roboto font-medium text-rich-black-900">Colaborador ativo</label>
              </div>
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Código do Funcionário
                </label>
                <input
                  type="text"
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="Ex: FUNC001"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Início de Contrato
                </label>
                <input
                  type="date"
                  name="admission_date"
                  value={formData.admission_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Tipo de Contrato
                </label>
                <select
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="">Selecione</option>
                  <option value="clt">CLT</option>
                  <option value="pj">PJ</option>
                  <option value="estagiario">Estagiário</option>
                  <option value="terceirizado">Terceirizado</option>
                  <option value="temporario">Temporário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Horário de Trabalho
                </label>
                <input
                  type="text"
                  name="work_schedule"
                  value={formData.work_schedule}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="Ex: 08:00 às 17:00"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  <Banknote className="h-4 w-4 inline mr-2" />
                  Salário
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-4 sm:p-6">
            <h2 className="text-lg font-roboto font-medium text-rich-black-900 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documentos e Benefícios
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-roboto font-medium text-rich-black-900 mb-4">Documentos (Fotos)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Foto do RG
                    </label>
                    <input
                      ref={rgPhotoRef}
                      type="file"
                      name="rg_photo"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({ ...prev, rg_photo: file.name }))
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yinmn-blue-50 file:text-yinmn-blue-700 hover:file:bg-yinmn-blue-100"
                    />
                    {formData.rg_photo && (
                      <p className="text-sm text-oxford-blue-600 mt-1">Arquivo selecionado: {formData.rg_photo}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Foto do CPF
                    </label>
                    <input
                      ref={cpfPhotoRef}
                      type="file"
                      name="cpf_photo"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({ ...prev, cpf_photo: file.name }))
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yinmn-blue-50 file:text-yinmn-blue-700 hover:file:bg-yinmn-blue-100"
                    />
                    {formData.cpf_photo && (
                      <p className="text-sm text-oxford-blue-600 mt-1">Arquivo selecionado: {formData.cpf_photo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Foto da CTPS
                    </label>
                    <input
                      ref={ctpsPhotoRef}
                      type="file"
                      name="ctps_photo"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({ ...prev, ctps_photo: file.name }))
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yinmn-blue-50 file:text-yinmn-blue-700 hover:file:bg-yinmn-blue-100"
                    />
                    {formData.ctps_photo && (
                      <p className="text-sm text-oxford-blue-600 mt-1">Arquivo selecionado: {formData.ctps_photo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Foto do Diploma
                    </label>
                    <input
                      ref={diplomaPhotoRef}
                      type="file"
                      name="diploma_photo"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setFormData(prev => ({ ...prev, diploma_photo: file.name }))
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yinmn-blue-50 file:text-yinmn-blue-700 hover:file:bg-yinmn-blue-100"
                    />
                    {formData.diploma_photo && (
                      <p className="text-sm text-oxford-blue-600 mt-1">Arquivo selecionado: {formData.diploma_photo}</p>
                    )}
                  </div>
                </div>
              </div>

              
              <div>
                <h3 className="text-md font-roboto font-medium text-rich-black-900 mb-4">Benefícios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      <Banknote className="h-4 w-4 inline mr-2" />
                      Vale Refeição (R$)
                    </label>
                    <input
                      type="number"
                      name="vale_refeicao"
                      value={formData.vale_refeicao}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="500.00"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Vale Transporte (R$)
                    </label>
                    <input
                      type="number"
                      name="vale_transporte"
                      value={formData.vale_transporte}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="200.00"
                      step="0.01"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="plano_saude"
                        checked={formData.plano_saude}
                        onChange={(e) => setFormData(prev => ({ ...prev, plano_saude: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-roboto font-medium text-rich-black-900">Plano de Saúde</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="plano_dental"
                        checked={formData.plano_dental}
                        onChange={(e) => setFormData(prev => ({ ...prev, plano_dental: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-roboto font-medium text-rich-black-900">Plano Dental</span>
                    </label>
                  </div>
                </div>
              </div>

              
              <div>
                <h3 className="text-md font-roboto font-medium text-rich-black-900 mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Dependentes (opcional)
                </h3>
                <p className="text-xs text-oxford-blue-500 mb-3">Preencha somente se o colaborador possuir dependentes.</p>
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-platinum-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Nome do Dependente 1
                      </label>
                      <input
                        type="text"
                        name="dependent_name_1"
                        value={formData.dependent_name_1}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Parentesco
                      </label>
                      <input
                        type="text"
                        name="dependent_relationship_1"
                        value={formData.dependent_relationship_1}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                        placeholder="Ex: filho, filha, cônjuge"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        name="dependent_birth_date_1"
                        value={formData.dependent_birth_date_1}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-platinum-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Nome do Dependente 2
                      </label>
                      <input
                        type="text"
                        name="dependent_name_2"
                        value={formData.dependent_name_2}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Parentesco
                      </label>
                      <input
                        type="text"
                        name="dependent_relationship_2"
                        value={formData.dependent_relationship_2}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                        placeholder="Ex: filho, filha, cônjuge"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        name="dependent_birth_date_2"
                        value={formData.dependent_birth_date_2}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-platinum-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Nome do Dependente 3
                      </label>
                      <input
                        type="text"
                        name="dependent_name_3"
                        value={formData.dependent_name_3}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Parentesco
                      </label>
                      <input
                        type="text"
                        name="dependent_relationship_3"
                        value={formData.dependent_relationship_3}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                        placeholder="Ex: filho, filha, cônjuge"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                        Data de Nascimento
                      </label>
                      <input
                        type="date"
                        name="dependent_birth_date_3"
                        value={formData.dependent_birth_date_3}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              
              <div>
                <h3 className="text-md font-roboto font-medium text-rich-black-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Educação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Nível de Escolaridade
                    </label>
                    <select
                      name="education_level"
                      value={formData.education_level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Selecione</option>
                      <option value="fundamental">Ensino Fundamental</option>
                      <option value="medio">Ensino Médio</option>
                      <option value="superior">Ensino Superior</option>
                      <option value="pos_graduacao">Pós-Graduação</option>
                      <option value="mestrado">Mestrado</option>
                      <option value="doutorado">Doutorado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Nome do Curso
                    </label>
                    <input
                      type="text"
                      name="course_name"
                      value={formData.course_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="Ex: Ciência da Computação"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Instituição
                    </label>
                    <input
                      type="text"
                      name="institution_name"
                      value={formData.institution_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="Ex: Universidade XYZ"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Ano de Conclusão
                    </label>
                    <input
                      type="number"
                      name="graduation_year"
                      value={formData.graduation_year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="2020"
                      min="1950"
                      max="2030"
                    />
                  </div>
                </div>
              </div>

              
              <div>
                <h3 className="text-md font-roboto font-medium text-rich-black-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Dados Bancários
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Nome do Banco
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="Ex: Banco do Brasil"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Agência
                    </label>
                    <input
                      type="text"
                      name="bank_agency"
                      value={formData.bank_agency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="1234"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Conta
                    </label>
                    <input
                      type="text"
                      name="bank_account"
                      value={formData.bank_account}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Tipo de Conta
                    </label>
                    <select
                      name="account_type"
                      value={formData.account_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="">Selecione</option>
                      <option value="corrente">Conta Corrente</option>
                      <option value="poupanca">Conta Poupança</option>
                      <option value="salario">Conta Salário</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                      Chave PIX
                    </label>
                    <input
                      type="text"
                      name="pix_key"
                      value={formData.pix_key}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                      placeholder="CPF, e-mail, telefone ou chave aleatória"
                    />
                  </div>
                </div>
              </div>

              
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="Observações adicionais sobre o colaborador..."
                />
              </div>
            </div>
            
            
            <div className="h-8"></div>
          </div>
        )}

        
        <div className="flex justify-between px-4 sm:px-6 py-6 sm:py-8">
          <button
            type="button"
            onClick={(e) => prevStep(e)}
            onMouseDown={(e) => e.preventDefault()}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-roboto font-medium transition-all duration-200 ${
              currentStep === 1
                ? 'bg-platinum-100 text-oxford-blue-400 cursor-not-allowed'
                : 'bg-white text-oxford-blue-600 border border-platinum-300 hover:bg-platinum-50'
            }`}
          >
            Anterior
          </button>

          <div className="flex gap-4">
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={(e) => nextStep(e)}
                onMouseDown={(e) => e.preventDefault()}
                className="px-6 py-3 text-white rounded-lg font-roboto font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: '#415A77' }}
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-roboto font-medium transition-all duration-200 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Colaborador
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
