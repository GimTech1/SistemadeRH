'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
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
  ArrowLeft,
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
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import * as Dialog from '@radix-ui/react-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { validateCPF, formatCPF, validateRG, formatRG, searchAddressByCEP, formatCEP } from '@/lib/validations'
import { useDepartmentAccess } from '@/lib/hooks/useDepartmentAccess'

interface EmployeeProfile {
  id: string
  full_name: string
  cpf: string
  rg: string
  birth_date: string
  gender: string
  marital_status: string
  nationality: string
  email: string
  personal_email: string
  phone: string
  mobile: string
  emergency_contact: string
  emergency_phone: string
  address: string
  number?: string
  complement?: string
  neighborhood?: string
  city: string
  state: string
  zip_code: string
  employee_id: string
  position: string
  department: string
  department_id: string
  admission_date: string
  contract_type: string
  work_schedule: string
  salary: number
  rg_photo?: string | null
  cpf_photo?: string | null
  rg_back_photo?: string | null
  cpf_back_photo?: string | null
  ctps_photo?: string | null
  diploma_photo?: string | null
  meal_voucher: number
  transport_voucher: number
  health_plan: boolean
  dental_plan: boolean
  children_count: number
  dependents: Array<{
    name: string
    relationship: string
    birth_date: string
    cpf?: string
  }>
  education_level: string
  institution: string
  course: string
  graduation_year: string
  certifications: string[]
  languages: string[]
  bank: string
  agency: string
  account: string
  account_type: string
  pix_key?: string  
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
  avatar_url: string
  status: 'active' | 'vacation' | 'leave' | 'inactive'
  notes: string
  updated_at?: string
}

export default function EmployeeProfilePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [employee, setEmployee] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('personal')
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editTab, setEditTab] = useState('pessoal')
  const [saving, setSaving] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [docFiles, setDocFiles] = useState<{ rg?: File; cpf?: File; rg_back?: File; cpf_back?: File; ctps?: File; diploma?: File }>({})
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
  const [departmentName, setDepartmentName] = useState<string>('')
  
  const [editData, setEditData] = useState({
    
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
    contacts: { personal_email: '', phone: '', cellphone: '', emergency_contact: '', emergency_phone: '' },
    address: { street: '', neighborhood: '', city: '', zip: '', state: '' },
    employee_code: '',
    admission_date: '',
    contract_type: '',
    work_schedule: '',
    salary: '',
    documents: { ctps: '', pis: '', voter_id: '', driver_license: '', military_cert: '' },
    benefits: { health_plan: '', dental_plan: '', life_insurance: '', meal_voucher: '', transport_voucher: '' },
    dependents: [] as Array<{ name: string; relationship: string; birth_date: string; cpf?: string }>,
    education: { level: '', institution: '', course: '', graduation_year: '', certifications: '', languages: '' },
    bank: { bank_name: '', agency: '', account: '', account_type: '', pix_key: '' },
    notes: '',
    is_active: true,
  })
  const supabase = createClient()
  const { canViewEmployeeSalary, loading: accessLoading } = useDepartmentAccess()

  useEffect(() => {
    loadEmployeeData()
  }, [params.id])

  useEffect(() => {   
    if (searchParams.get('edit')) {
      setIsEditOpen(true)
    }
  }, [searchParams])

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

      const deps: Array<{ name: string; relationship: string; birth_date: string; cpf?: string }> = []
      const d1 = {
        name: (data as any).dependent_name_1,
        relationship: (data as any).dependent_relationship_1,
        birth_date: (data as any).dependent_birth_date_1,
      }
      const d2 = {
        name: (data as any).dependent_name_2,
        relationship: (data as any).dependent_relationship_2,
        birth_date: (data as any).dependent_birth_date_2,
      }
      const d3 = {
        name: (data as any).dependent_name_3,
        relationship: (data as any).dependent_relationship_3,
        birth_date: (data as any).dependent_birth_date_3,
      }
      ;[d1, d2, d3].forEach((d) => {
        if (d.name) deps.push({ name: d.name, relationship: d.relationship, birth_date: d.birth_date })
      })

      const contacts = {
        personal_email: (data as any).personal_email || '',
        phone: (data as any).phone || '',
        cellphone: (data as any).mobile || '',
        emergency_contact: (data as any).emergency_contact || '',
        emergency_phone: (data as any).emergency_phone || '',
      }
      const address = {
        street: (data as any).address || '',
        neighborhood: (data as any).neighborhood || '',
        city: (data as any).city || '',
        zip: (data as any).zip_code || '',
        state: (data as any).state || '',
      }
      const documents = {
        rg_photo: (data as any).rg_photo || null,
        cpf_photo: (data as any).cpf_photo || null,
        rg_back_photo: (data as any).rg_back_photo || null,
        cpf_back_photo: (data as any).cpf_back_photo || null,
        ctps_photo: (data as any).ctps_photo || null,
        diploma_photo: (data as any).diploma_photo || null,
      }
      const benefits = {
        meal_voucher: (data as any).vale_refeicao || 0,
        transport_voucher: (data as any).vale_transporte || 0,
        health_plan: (data as any).plano_saude || false,
        dental_plan: (data as any).plano_dental || false,
      }
      const education = {
        level: (data as any).education_level || '',
        institution: (data as any).institution_name || '',
        course: (data as any).course_name || '',
        graduation_year: (data as any).graduation_year || '',
        certifications: '',
        languages: '',
      }
      const bank = {
        bank_name: (data as any).bank_name || '',
        agency: (data as any).bank_agency || '',
        account: (data as any).bank_account || '',
        account_type: (data as any).account_type || '',
        pix_key: (data as any).pix_key || '',
      }

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
        personal_email: contacts.personal_email,
        phone: contacts.phone,
        mobile: contacts.cellphone,
        emergency_contact: contacts.emergency_contact,
        emergency_phone: contacts.emergency_phone,

        address: address.street,
        number: undefined,
        complement: undefined,
        neighborhood: address.neighborhood,
        city: address.city,
        state: address.state,
        zip_code: address.zip,
        
        employee_id: (data as any).employee_code || '',
        position: (data as any).position || '',
        department: (data as any).department || '',
        department_id: (data as any).department_id || (data as any).department || '',
        admission_date: (data as any).admission_date || '',
        contract_type: (data as any).contract_type || '',
        work_schedule: (data as any).work_schedule || '',
        salary: (data as any).salary || 0,
        
        rg_photo: (data as any).rg_photo || null,
        cpf_photo: (data as any).cpf_photo || null,
        rg_back_photo: (data as any).rg_back_photo || null,
        cpf_back_photo: (data as any).cpf_back_photo || null,
        ctps_photo: (data as any).ctps_photo || null,
        diploma_photo: (data as any).diploma_photo || null,
        
        health_plan: !!(data as any).plano_saude,
        dental_plan: !!(data as any).plano_dental,
        meal_voucher: Number((data as any).vale_refeicao) || 0,
        transport_voucher: Number((data as any).vale_transporte) || 0,
        
        children_count: deps.length,
        dependents: deps as any,
        
        education_level: education.level,
        institution: education.institution,
        course: education.course,
        graduation_year: education.graduation_year,
        certifications: [],
        languages: [],
        
        bank: (data as any).bank_name || '',
        agency: (data as any).bank_agency || '',
        account: (data as any).bank_account || '',
        account_type: (data as any).account_type || '',
        pix_key: (data as any).pix_key || '',
        
        overall_score: (data as any).overall_score || null, 
        total_evaluations: (data as any).total_evaluations || 0, 
        cha_scores: {
          conhecimento: (data as any).cha_conhecimento || null, 
          habilidade: (data as any).cha_habilidade || null, 
          atitude: (data as any).cha_atitude || null, 
        },
        recent_feedbacks: (data as any).recent_feedbacks || [], 
        goals: (data as any).goals || [], 
        evaluations_history: (data as any).evaluations_history || [], 
        
        avatar_url: (data as any).avatar_url || '',
        status: ((data as any).is_active !== false) ? 'active' : 'inactive',
        notes: (data as any).notes || '',
        updated_at: (data as any).updated_at,
      })

      if ((data as any).department) {
        try {
          const { data: deptData } = await supabase
            .from('departments')
            .select('name')
            .eq('id', (data as any).department)
            .single()
          
          if (deptData) {
            setDepartmentName((deptData as any).name || '—')
          }
        } catch (error) {
          setDepartmentName('—')
        }
      } else {
        setDepartmentName('—')
      }

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
        contacts: contacts,
        address: address,
        employee_code: dataAny.employee_code || '',
        admission_date: dataAny.admission_date || '',
        contract_type: dataAny.contract_type || '',
        work_schedule: dataAny.work_schedule || '',
        salary: dataAny.salary?.toString() || '',
        documents: documents as any,
        benefits: benefits as any,
        dependents: deps,
        education: education as any,
        bank: bank as any,
        notes: dataAny.notes || '',
        is_active: (dataAny.is_active !== false),
      })
    } catch (error) {
      toast.error('Erro ao carregar dados do colaborador')
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatarAndSave = async (blobOrFile: Blob | File) => {
    const file = blobOrFile instanceof File ? blobOrFile : new File([blobOrFile], `avatar-${Date.now()}.png`, { type: 'image/png' })
    const filename = `avatar-${employee?.id}-${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('employee-documents').upload(filename, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('employee-documents').getPublicUrl(filename)
    const publicUrl = data.publicUrl
    await fetch(`/api/employees/${employee?.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar_url: publicUrl }),
    })
    setEmployee(prev => prev ? { ...prev, avatar_url: publicUrl } : prev)
    toast.success('Foto de perfil atualizada')
  }

  const onAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      await uploadAvatarAndSave(f)
    } catch (err: any) {
      toast.error(err.message || 'Falha ao enviar foto')
    }
  }

  const startCamera = async () => {
    try {
      setShowCamera(true)
      await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
      const constraints: MediaStreamConstraints = { video: { facingMode: 'user' }, audio: false }
      if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop())
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setMediaStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream as any
        await videoRef.current.play().catch(() => {})
      }
    } catch {
      toast.error('Não foi possível acessar a câmera')
      setShowCamera(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop())
      setMediaStream(null)
    }
    setShowCamera(false)
  }

  useEffect(() => {
    if (!isEditOpen) {
      stopCamera()
    }
  }, [isEditOpen])

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || capturing) return
    setCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(async (blob: Blob | null) => {
      if (!blob) return
      try {
        await uploadAvatarAndSave(blob)
        stopCamera()
      } catch (err: any) {
        toast.error(err.message || 'Falha ao salvar foto')
      } finally {
        setCapturing(false)
      }
    }, 'image/png')
  }

  const handleRemoveDocument = async (column: 'rg_photo' | 'cpf_photo' | 'rg_back_photo' | 'cpf_back_photo' | 'ctps_photo' | 'diploma_photo') => {
    if (!employee) return
    try {
      const updatePayload: Record<string, any> = { [column]: null }
      const { error } = await (supabase as any)
        .from('employees')
        .update(updatePayload)
        .eq('id', employee.id)
      if (error) throw error
      setEmployee(prev => prev ? ({ ...prev, [column]: null } as any) : prev)
      toast.success('Documento removido')
    } catch (e: any) {
      toast.error('Não foi possível remover o documento')
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

  const withVersion = (url?: string | null, version?: string | number) => {
    if (!url) return ''
    const sep = url.includes('?') ? '&' : '?'
    return `${url}${sep}v=${version ?? Date.now()}`
  }

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <p className="text-sm tracking-wide text-slate-700">{label}</p>
      <p className="text-slate-950 font-semibold mt-0.5">{value || '-'}</p>
    </div>
  )

  const Badge = ({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue'|'green'|'red'|'gray' }) => {
    const map: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800 border border-blue-300',
      green: 'bg-green-100 text-green-800 border border-green-300',
      red: 'bg-red-100 text-red-800 border border-red-300',
      gray: 'bg-slate-100 text-slate-800 border border-slate-300',
    }
    return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${map[color]}`}>{children}</span>
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const formattedValue = formatCPF(value)
    
    setEditData(prev => ({
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
    
    setEditData(prev => ({
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
    
    setEditData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        zip: formattedValue
      }
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
          setEditData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              street: result.data!.logradouro,
              neighborhood: result.data!.bairro,
              city: result.data!.localidade,
              state: result.data!.uf
            }
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
    if (isEditOpen) {
      fetchDepartments()
    }
  }, [isEditOpen])

  const handleSaveEdit = async () => {
    try {
      setSaving(true)
      const uploaded: Record<string, string | undefined> = {}
      const uploadFile = async (file: File, prefix: string) => {
        const filename = `${prefix}-${params.id}-${Date.now()}-${file.name}`
        const { error } = await supabase.storage.from('employee-documents').upload(filename, file, { upsert: true })
        if (error) throw error
        const { data: urlData } = supabase.storage.from('employee-documents').getPublicUrl(filename)
        return urlData.publicUrl
      }

      if (avatarFile) uploaded.avatar_url = await uploadFile(avatarFile, 'avatar')
      if (docFiles.rg) uploaded.rg_photo = await uploadFile(docFiles.rg, 'rg')
      if (docFiles.cpf) uploaded.cpf_photo = await uploadFile(docFiles.cpf, 'cpf')
      if (docFiles.ctps) uploaded.ctps_photo = await uploadFile(docFiles.ctps, 'ctps')
      if (docFiles.diploma) uploaded.diploma_photo = await uploadFile(docFiles.diploma, 'diploma')

      const payload: Record<string, any> = {
        ...(editData.name && editData.name.trim() ? { full_name: editData.name.trim() } : {}),
        email: editData.email,
        position: editData.position,
        department: editData.department,
        cpf: editData.cpf,
        rg: editData.rg,
        birth_date: editData.birth_date || null,
        gender: editData.gender || null,
        marital_status: editData.marital_status || null,
        nationality: editData.nationality || null,
        phone: editData.contacts?.phone || null,
        personal_email: editData.contacts?.personal_email || null,
        mobile: editData.contacts?.cellphone || null,
        emergency_contact: editData.contacts?.emergency_contact || null,
        emergency_phone: (editData as any).contacts?.emergency_phone ?? null,
        address: editData.address?.street || null,
        neighborhood: editData.address?.neighborhood || null,
        city: editData.address?.city || null,
        state: editData.address?.state || null,
        zip_code: editData.address?.zip || null,
        employee_code: editData.employee_code || null,
        admission_date: editData.admission_date || null,
        contract_type: editData.contract_type || null,
        work_schedule: editData.work_schedule || null,
        salary: editData.salary ? Number(editData.salary) : null,
        education_level: (editData as any).education?.level || null,
        course_name: (editData as any).education?.course || null,
        institution_name: (editData as any).education?.institution || null,
        graduation_year: (editData as any).education?.graduation_year || null,
        dependent_name_1: editData.dependents?.[0]?.name || null,
        dependent_relationship_1: editData.dependents?.[0]?.relationship || null,
        dependent_birth_date_1: editData.dependents?.[0]?.birth_date || null,
        dependent_name_2: editData.dependents?.[1]?.name || null,
        dependent_relationship_2: editData.dependents?.[1]?.relationship || null,
        dependent_birth_date_2: editData.dependents?.[1]?.birth_date || null,
        dependent_name_3: editData.dependents?.[2]?.name || null,
        dependent_relationship_3: editData.dependents?.[2]?.relationship || null,
        dependent_birth_date_3: editData.dependents?.[2]?.birth_date || null,
        bank_name: (editData as any).bank?.bank_name || null,
        bank_agency: (editData as any).bank?.agency || null,
        bank_account: (editData as any).bank?.account || null,
        account_type: (editData as any).bank?.account_type || null,
        pix_key: (editData as any).bank?.pix_key || null,
        vale_refeicao: (editData as any).benefits?.meal_voucher ?? null,
        vale_transporte: (editData as any).benefits?.transport_voucher ?? null,
        plano_saude: (editData as any).benefits?.health_plan ?? null,
        plano_dental: (editData as any).benefits?.dental_plan ?? null,
        is_active: (editData as any).is_active ?? true,
        ...uploaded,
      }

      const res = await fetch(`/api/employees/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message || 'Falha ao salvar')
      }

      const backs: Array<{ employee_id: string; doc_type: 'rg' | 'cpf'; back_url: string }> = []
      const uploadedBacks: Record<string, string> = {}
      if (docFiles.rg_back) uploadedBacks.rg_back_photo = await uploadFile(docFiles.rg_back, 'rg-verso')
      if (docFiles.cpf_back) uploadedBacks.cpf_back_photo = await uploadFile(docFiles.cpf_back, 'cpf-verso')
      if (Object.keys(uploadedBacks).length) {
        const { error: backUpdateError } = await (supabase as any)
          .from('employees')
          .update(uploadedBacks)
          .eq('id', params.id as string)
      }

      toast.success('Colaborador atualizado com sucesso')
      setIsEditOpen(false)
      await loadEmployeeData() 
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar colaborador')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!employee) return
    
    try {
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.width = '210mm'
      tempDiv.style.padding = '20mm'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '12px'
      tempDiv.style.lineHeight = '1.4'
      tempDiv.style.color = '#333'
      
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1B263B; padding-bottom: 20px;">
          <h1 style="color: #1B263B; font-size: 28px; margin: 0; font-weight: bold;">FICHA DO COLABORADOR</h1>
          <p style="color: #666; font-size: 14px; margin: 10px 0 0 0;">Sistema de Recursos Humanos</p>
        </div>

        <div style="display: flex; margin-bottom: 25px; align-items: center;">
          <div style="width: 80px; height: 80px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; font-size: 24px; font-weight: bold; color: #666;">
            ${employee.avatar_url ? 
              `<img src="${employee.avatar_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />` : 
              employee.full_name.split(' ').map(n => n[0]).join('')
            }
          </div>
          <div>
            <h2 style="color: #1B263B; font-size: 24px; margin: 0; font-weight: bold;">${employee.full_name}</h2>
            <p style="color: #666; font-size: 16px; margin: 5px 0;">${employee.position}</p>
            <p style="color: #888; font-size: 14px; margin: 0;">${departmentName} • Matrícula: ${employee.employee_id}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">INFORMAÇÕES PESSOAIS</h3>
            <div style="margin-bottom: 8px;"><strong>Nome:</strong> ${employee.full_name}</div>
            <div style="margin-bottom: 8px;"><strong>CPF:</strong> ${employee.cpf || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>RG:</strong> ${employee.rg || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Data de Nascimento:</strong> ${employee.birth_date || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Gênero:</strong> ${employee.gender || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Estado Civil:</strong> ${employee.marital_status || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Nacionalidade:</strong> ${employee.nationality || '-'}</div>
          </div>
          
          <div>
            <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">CONTATOS</h3>
            <div style="margin-bottom: 8px;"><strong>E-mail Corporativo:</strong> ${employee.email || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>E-mail Pessoal:</strong> ${employee.personal_email || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Telefone:</strong> ${employee.phone || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Celular:</strong> ${employee.mobile || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Contato de Emergência:</strong> ${employee.emergency_contact || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Telefone de Emergência:</strong> ${employee.emergency_phone || '-'}</div>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">ENDEREÇO</h3>
          <div style="margin-bottom: 8px;"><strong>Logradouro:</strong> ${employee.address || '-'}</div>
          <div style="margin-bottom: 8px;"><strong>Bairro:</strong> ${employee.neighborhood || '-'}</div>
          <div style="margin-bottom: 8px;"><strong>CEP:</strong> ${employee.zip_code || '-'}</div>
          <div style="margin-bottom: 8px;"><strong>Cidade:</strong> ${employee.city || '-'}</div>
          <div style="margin-bottom: 8px;"><strong>Estado:</strong> ${employee.state || '-'}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">INFORMAÇÕES PROFISSIONAIS</h3>
            <div style="margin-bottom: 8px;"><strong>Matrícula:</strong> ${employee.employee_id || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Cargo:</strong> ${employee.position || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Departamento:</strong> ${departmentName || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Início de Contrato:</strong> ${employee.admission_date || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Tipo de Contrato:</strong> ${employee.contract_type || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Jornada de Trabalho:</strong> ${employee.work_schedule || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Salário Base:</strong> ${canViewEmployeeSalary(employee.department_id || '') ? 'R$ ' + (employee.salary?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00') : '*** Acesso restrito ***'}</div>
          </div>
          
          <div>
            <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">BENEFÍCIOS</h3>
            <div style="margin-bottom: 8px;"><strong>Plano de Saúde:</strong> <span style="color: ${employee.health_plan ? '#28a745' : '#dc3545'}; font-weight: bold;">${employee.health_plan ? 'Ativo' : 'Inativo'}</span></div>
            <div style="margin-bottom: 8px;"><strong>Plano Odontológico:</strong> <span style="color: ${employee.dental_plan ? '#28a745' : '#dc3545'}; font-weight: bold;">${employee.dental_plan ? 'Ativo' : 'Inativo'}</span></div>
            <div style="margin-bottom: 8px;"><strong>Vale Refeição:</strong> R$ ${employee.meal_voucher?.toFixed(2) || '0,00'}</div>
            <div style="margin-bottom: 8px;"><strong>Vale Transporte:</strong> R$ ${employee.transport_voucher?.toFixed(2) || '0,00'}</div>
          </div>
        </div>

        ${employee.dependents && employee.dependents.length > 0 ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">DEPENDENTES</h3>
              ${employee.dependents.map((dep, index) => `
            <div style="background: #f8f9fa; padding: 15px; margin-bottom: 15px; border-left: 4px solid #1B263B;">
              <h4 style="color: #1B263B; font-size: 14px; margin: 0 0 10px 0;">Dependente ${index + 1}</h4>
              <div style="margin-bottom: 5px;"><strong>Nome:</strong> ${dep.name}</div>
              <div style="margin-bottom: 5px;"><strong>Parentesco:</strong> ${dep.relationship}</div>
              <div style="margin-bottom: 5px;"><strong>Data de Nascimento:</strong> ${dep.birth_date}</div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">FORMAÇÃO ACADÊMICA</h3>
            <div style="margin-bottom: 8px;"><strong>Nível de Escolaridade:</strong> ${employee.education_level || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Instituição:</strong> ${employee.institution || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Curso:</strong> ${employee.course || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Ano de Conclusão:</strong> ${employee.graduation_year || '-'}</div>
          </div>
          
          <div>
            <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">INFORMAÇÕES BANCÁRIAS</h3>
            <div style="margin-bottom: 8px;"><strong>Banco:</strong> ${employee.bank || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Agência:</strong> ${employee.agency || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Conta:</strong> ${employee.account || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Tipo de Conta:</strong> ${employee.account_type || '-'}</div>
            <div style="margin-bottom: 8px;"><strong>Chave PIX:</strong> ${employee.pix_key || '-'}</div>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">DESEMPENHO</h3>
          <div style="margin-bottom: 8px;"><strong>Pontuação Geral:</strong> ${employee.overall_score || '-'}</div>
          <div style="margin-bottom: 8px;"><strong>Total de Avaliações:</strong> ${employee.total_evaluations || 0}</div>
          <div style="margin-bottom: 8px;"><strong>CHA:</strong> C ${employee.cha_scores?.conhecimento || '-'} | H ${employee.cha_scores?.habilidade || '-'} | A ${employee.cha_scores?.atitude || '-'}</div>
        </div>

        ${employee.notes ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1B263B; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 8px; border-bottom: 2px solid #1B263B;">OBSERVAÇÕES</h3>
          <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #1B263B;">${employee.notes}</div>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 10px;">
          Documento gerado em ${new Date().toLocaleString('pt-BR')}
        </div>
      `
      
      document.body.appendChild(tempDiv)
            
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      document.body.removeChild(tempDiv)
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      
      let position = 0
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
      
      const fileName = `ficha-${employee.full_name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('PDF baixado com sucesso')
    } catch (error) {
      toast.error('Erro ao gerar PDF')
    }
  }

  const handlePrint = () => {
    if (!employee) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ficha do Colaborador - ${employee.full_name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #1B263B; border-bottom: 2px solid #1B263B; padding-bottom: 10px; }
            h2 { color: #1B263B; margin-top: 30px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            h3 { color: #666; margin-top: 20px; }
            .section { margin-bottom: 25px; }
            .field { margin-bottom: 8px; }
            .label { font-weight: bold; color: #333; }
            .value { margin-left: 10px; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
            .status.active { background: #d4edda; color: #155724; }
            .status.inactive { background: #f8d7da; color: #721c24; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Ficha do Colaborador</h1>
          
          <div class="section">
            <h2>Informações Pessoais</h2>
            <div class="field"><span class="label">Nome:</span><span class="value">${employee.full_name}</span></div>
            <div class="field"><span class="label">CPF:</span><span class="value">${employee.cpf || '-'}</span></div>
            <div class="field"><span class="label">RG:</span><span class="value">${employee.rg || '-'}</span></div>
            <div class="field"><span class="label">Data de Nascimento:</span><span class="value">${employee.birth_date || '-'}</span></div>
            <div class="field"><span class="label">Gênero:</span><span class="value">${employee.gender || '-'}</span></div>
            <div class="field"><span class="label">Estado Civil:</span><span class="value">${employee.marital_status || '-'}</span></div>
            <div class="field"><span class="label">Nacionalidade:</span><span class="value">${employee.nationality || '-'}</span></div>
          </div>

          <div class="section">
            <h2>Contatos</h2>
            <div class="field"><span class="label">E-mail Corporativo:</span><span class="value">${employee.email || '-'}</span></div>
            <div class="field"><span class="label">E-mail Pessoal:</span><span class="value">${employee.personal_email || '-'}</span></div>
            <div class="field"><span class="label">Telefone:</span><span class="value">${employee.phone || '-'}</span></div>
            <div class="field"><span class="label">Celular:</span><span class="value">${employee.mobile || '-'}</span></div>
            <div class="field"><span class="label">Contato de Emergência:</span><span class="value">${employee.emergency_contact || '-'}</span></div>
            <div class="field"><span class="label">Telefone de Emergência:</span><span class="value">${employee.emergency_phone || '-'}</span></div>
          </div>

          <div class="section">
            <h2>Endereço</h2>
            <div class="field"><span class="label">Logradouro:</span><span class="value">${employee.address || '-'}</span></div>
            <div class="field"><span class="label">Bairro:</span><span class="value">${employee.neighborhood || '-'}</span></div>
            <div class="field"><span class="label">CEP:</span><span class="value">${employee.zip_code || '-'}</span></div>
            <div class="field"><span class="label">Cidade:</span><span class="value">${employee.city || '-'}</span></div>
            <div class="field"><span class="label">Estado:</span><span class="value">${employee.state || '-'}</span></div>
          </div>

          <div class="section">
            <h2>Informações Profissionais</h2>
            <div class="field"><span class="label">Matrícula:</span><span class="value">${employee.employee_id || '-'}</span></div>
            <div class="field"><span class="label">Cargo:</span><span class="value">${employee.position || '-'}</span></div>
            <div class="field"><span class="label">Departamento:</span><span class="value">${departmentName || '-'}</span></div>
            <div class="field"><span class="label">Início de Contrato:</span><span class="value">${employee.admission_date || '-'}</span></div>
            <div class="field"><span class="label">Tipo de Contrato:</span><span class="value">${employee.contract_type || '-'}</span></div>
            <div class="field"><span class="label">Jornada de Trabalho:</span><span class="value">${employee.work_schedule || '-'}</span></div>
            <div class="field"><span class="label">Salário Base:</span><span class="value">${canViewEmployeeSalary(employee.department_id || '') ? 'R$ ' + (employee.salary?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00') : '*** Acesso restrito ***'}</span></div>
          </div>

          <div class="section">
            <h2>Benefícios</h2>
            <div class="field"><span class="label">Plano de Saúde:</span><span class="value"><span class="status ${employee.health_plan ? 'active' : 'inactive'}">${employee.health_plan ? 'Ativo' : 'Inativo'}</span></span></div>
            <div class="field"><span class="label">Plano Odontológico:</span><span class="value"><span class="status ${employee.dental_plan ? 'active' : 'inactive'}">${employee.dental_plan ? 'Ativo' : 'Inativo'}</span></span></div>
            <div class="field"><span class="label">Vale Refeição:</span><span class="value">R$ ${employee.meal_voucher?.toFixed(2) || '0,00'}</span></div>
            <div class="field"><span class="label">Vale Transporte:</span><span class="value">R$ ${employee.transport_voucher?.toFixed(2) || '0,00'}</span></div>
          </div>

          ${employee.dependents && employee.dependents.length > 0 ? `
          <div class="section">
            <h2>Dependentes</h2>
            ${employee.dependents.map((dep, index) => `
              <h3>Dependente ${index + 1}</h3>
              <div class="field"><span class="label">Nome:</span><span class="value">${dep.name}</span></div>
              <div class="field"><span class="label">Parentesco:</span><span class="value">${dep.relationship}</span></div>
              <div class="field"><span class="label">Data de Nascimento:</span><span class="value">${dep.birth_date}</span></div>
            `).join('')}
          </div>
          ` : ''}

          <div class="section">
            <h2>Formação Acadêmica</h2>
            <div class="field"><span class="label">Nível de Escolaridade:</span><span class="value">${employee.education_level || '-'}</span></div>
            <div class="field"><span class="label">Instituição:</span><span class="value">${employee.institution || '-'}</span></div>
            <div class="field"><span class="label">Curso:</span><span class="value">${employee.course || '-'}</span></div>
            <div class="field"><span class="label">Ano de Conclusão:</span><span class="value">${employee.graduation_year || '-'}</span></div>
          </div>

          <div class="section">
            <h2>Informações Bancárias</h2>
            <div class="field"><span class="label">Banco:</span><span class="value">${employee.bank || '-'}</span></div>
            <div class="field"><span class="label">Agência:</span><span class="value">${employee.agency || '-'}</span></div>
            <div class="field"><span class="label">Conta:</span><span class="value">${employee.account || '-'}</span></div>
            <div class="field"><span class="label">Tipo de Conta:</span><span class="value">${employee.account_type || '-'}</span></div>
            <div class="field"><span class="label">Chave PIX:</span><span class="value">${employee.pix_key || '-'}</span></div>
          </div>

          <div class="section">
            <h2>Desempenho</h2>
            <div class="field"><span class="label">Pontuação Geral:</span><span class="value">${employee.overall_score || '-'}</span></div>
            <div class="field"><span class="label">Total de Avaliações:</span><span class="value">${employee.total_evaluations || 0}</span></div>
            <div class="field"><span class="label">CHA:</span><span class="value">C ${employee.cha_scores?.conhecimento || '-'} | H ${employee.cha_scores?.habilidade || '-'} | A ${employee.cha_scores?.atitude || '-'}</span></div>
          </div>

          ${employee.notes ? `
          <div class="section">
            <h2>Observações</h2>
            <p>${employee.notes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; font-size: 12px; color: #666;">
            Documento gerado em ${new Date().toLocaleString('pt-BR')}
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
    
    toast.success('Impressão iniciada')
  }

  const handleShare = async () => {
    if (!employee) return
    
    const shareData = {
      title: `Ficha do Colaborador - ${employee.full_name}`,
      text: `Dados do colaborador ${employee.full_name} - ${employee.position} - ${departmentName}`,
      url: window.location.href
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success('Compartilhado com sucesso')
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Link copiado para a área de transferência')
      }
    } catch (error) {
      try {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Link copiado para a área de transferência')
      } catch (clipboardError) {
        toast.error('Não foi possível compartilhar')
      }
    }
  }

  const handleDeleteEmployee = async () => {
    if (!employee) return
    
    setDeleting(true)
    
    try {
      const response = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Erro ao excluir colaborador')
      }
      
      toast.success('Colaborador excluído com sucesso')
      setIsDeleteOpen(false)
      
      window.location.href = '/employees'
    } catch (error: any) {
      toast.error('Erro ao excluir colaborador: ' + (error.message || 'Erro inesperado'))
    } finally {
      setDeleting(false)
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
      <div>
        <Link href="/employees">
          <Button variant="ghost" size="sm" className="px-2 py-2 rounded-xl text-slate-500 hover:text-slate-700" aria-label="Voltar" title="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      <Card className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex items-start space-x-6 flex-1 min-w-0">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center text-2xl sm:text-3xl font-medium text-white/90 flex-shrink-0">
              {employee.avatar_url ? (
                <img src={withVersion(employee.avatar_url, employee.updated_at)} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-slate-500">{employee.full_name.split(' ').map(n => n[0]).join('')}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-4">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900">{employee.full_name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs text-white w-fit ${getStatusColor(employee.status)}`}>
                  {employee.status === 'active' && 'Ativo'}
                  {employee.status === 'vacation' && 'Férias'}
                  {employee.status === 'leave' && 'Afastado'}
                  {employee.status === 'inactive' && 'Inativo'}
                </span>
              </div>
              <p className="text-slate-600 text-base sm:text-lg mb-4">{employee.position}</p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm sm:text-base text-slate-600">
                <span className="flex items-center">
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{departmentName}</span>
                </span>
                <span className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{employee.employee_id}</span>
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Desde {employee.admission_date}</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end lg:space-y-3 lg:space-x-0">
            <div className="flex items-center space-x-2">
              <Button variant="secondary" size="sm" onClick={handleDownload} title="Baixar ficha" className="p-3">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={handlePrint} title="Imprimir ficha" className="p-3">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare} title="Compartilhar" className="p-3">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsDeleteOpen(true)} title="Excluir colaborador" className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="primary" size="md" className="!bg-[#1B263B] hover:opacity-90 px-6 py-3" onClick={() => setIsEditOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </Card>

      
      <div className="border-b border-neutral-200">
        <div className="lg:hidden px-4 py-2 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-center text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              ← Deslize para ver mais abas →
            </span>
          </div>
        </div>
        
        <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
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
                className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 text-xs sm:text-sm font-medium transition-colors flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {activeTab === 'personal' && (
          <>
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                  <Field label="Nome Completo" value={employee.full_name} />
                  <Field label="CPF" value={employee.cpf} />
                  <Field label="RG" value={employee.rg} />
                  <Field label="Data de Nascimento" value={employee.birth_date} />
                  <Field label="Gênero" value={employee.gender} />
                  <Field label="Estado Civil" value={employee.marital_status} />
                  <Field label="Nacionalidade" value={employee.nationality} />
                </CardContent>
              </Card>

              
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center text-base sm:text-lg"><MapPin className="h-4 w-4 mr-2" />Endereço</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
                  <div className="col-span-2">
                    <Field label="Logradouro" value={<>{employee.address}{employee.number ? `, ${employee.number}` : ''} {employee.complement}</>} />
                  </div>
                  <Field label="Bairro" value={employee.neighborhood} />
                  <Field label="CEP" value={employee.zip_code} />
                  <Field label="Cidade" value={employee.city} />
                  <Field label="Estado" value={employee.state} />
                </CardContent>
              </Card>
            </div>

            
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Contatos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:gap-6 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Field label="E-mail Corporativo" value={employee.email ? <a className="break-all underline" href={`mailto:${employee.email}`}>{employee.email}</a> : '-'} />
                  <Field label="E-mail Pessoal" value={employee.personal_email ? <a className="break-all underline" href={`mailto:${employee.personal_email}`}>{employee.personal_email}</a> : '-'} />
                  <Field label="Telefone" value={employee.phone} />
                  <Field label="Celular" value={employee.mobile} />
              </div>
                <div className="pt-4 border-t border-neutral-200 grid grid-cols-2 gap-6">
                  <Field label="Contato de Emergência" value={employee.emergency_contact} />
                  <Field label="Telefone de Emergência" value={employee.emergency_phone} />
                </div>
              </CardContent>
            </Card>
            
            <div className="h-8"></div>
          </>
        )}

        {activeTab === 'professional' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Informações Profissionais</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-6">
                <Field label="Matrícula" value={employee.employee_id} />
                <Field label="Cargo" value={employee.position} />
                <Field label="Departamento" value={departmentName} />
                <Field label="Início de Contrato" value={employee.admission_date} />
                <Field label="Tipo de Contrato" value={employee.contract_type} />
                <Field label="Jornada de Trabalho" value={employee.work_schedule} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Salário Base</p>
                  {canViewEmployeeSalary(employee.department_id || '') ? (
                    <p className="text-slate-900 font-semibold mt-0.5">R$ {employee.salary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  ) : (
                    <p className="text-slate-500 font-semibold mt-0.5">Acesso restrito</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Documentação</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-700 mb-2">RG (Frente)</p>
                  {employee.rg_photo ? (
                    <a href={withVersion(employee.rg_photo as any, employee.updated_at)} target="_blank" rel="noreferrer" className="block">
                      <img src={withVersion(employee.rg_photo as any, employee.updated_at)} alt="RG Frente" className="w-full h-28 object-cover rounded-lg border border-neutral-800" />
                    </a>
                  ) : (
                    <p className="text-slate-700">Não enviado</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">RG (Verso)</p>
                  {(employee as any).rg_back_photo ? (
                    <a href={withVersion((employee as any).rg_back_photo, employee.updated_at)} target="_blank" rel="noreferrer" className="block">
                      <img src={withVersion((employee as any).rg_back_photo, employee.updated_at)} alt="RG Verso" className="w-full h-28 object-cover rounded-lg border border-neutral-800" />
                    </a>
                  ) : (
                    <p className="text-slate-700">Não enviado</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">CPF (Frente)</p>
                  {employee.cpf_photo ? (
                    <a href={withVersion(employee.cpf_photo as any, employee.updated_at)} target="_blank" rel="noreferrer" className="block">
                      <img src={withVersion(employee.cpf_photo as any, employee.updated_at)} alt="CPF Frente" className="w-full h-28 object-cover rounded-lg border border-neutral-800" />
                    </a>
                  ) : (
                    <p className="text-slate-700">Não enviado</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">CPF (Verso)</p>
                  {(employee as any).cpf_back_photo ? (
                    <a href={withVersion((employee as any).cpf_back_photo, employee.updated_at)} target="_blank" rel="noreferrer" className="block">
                      <img src={withVersion((employee as any).cpf_back_photo, employee.updated_at)} alt="CPF Verso" className="w-full h-28 object-cover rounded-lg border border-neutral-800" />
                    </a>
                  ) : (
                    <p className="text-slate-700">Não enviado</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">CTPS</p>
                  {employee.ctps_photo ? (
                    <a href={withVersion(employee.ctps_photo as any, employee.updated_at)} target="_blank" rel="noreferrer" className="block">
                      <img src={withVersion(employee.ctps_photo as any, employee.updated_at)} alt="CTPS" className="w-full h-28 object-cover rounded-lg border border-neutral-800" />
                    </a>
                  ) : (
                    <p className="text-slate-700">Não enviado</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-slate-700 mb-2">Diploma</p>
                  {employee.diploma_photo ? (
                    <a href={withVersion(employee.diploma_photo as any, employee.updated_at)} target="_blank" rel="noreferrer" className="block">
                      <img src={withVersion(employee.diploma_photo as any, employee.updated_at)} alt="Diploma" className="w-full h-28 object-cover rounded-lg border border-neutral-800" />
                    </a>
                  ) : (
                    <p className="text-slate-700">Não enviado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'benefits' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Benefícios</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Plano de Saúde</p>
                  <Badge color={employee.health_plan ? 'green' : 'red'}>{employee.health_plan ? 'Ativo' : 'Inativo'}</Badge>
              </div>
                <div className="flex items-center gap-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Plano Odontológico</p>
                  <Badge color={employee.dental_plan ? 'green' : 'red'}>{employee.dental_plan ? 'Ativo' : 'Inativo'}</Badge>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Vale Refeição</p>
                  <p className="text-slate-900 font-semibold mt-0.5">R$ {employee.meal_voucher.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Vale Transporte</p>
                  <p className="text-slate-900 font-semibold mt-0.5">R$ {employee.transport_voucher.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'family' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Dependentes</CardTitle>
              </CardHeader>
              <CardContent>
                {employee.dependents && employee.dependents.length > 0 ? (
                  <div className="space-y-4">
                    {employee.dependents.map((dep, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-slate-200">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-slate-700">Nome</p>
                            <p className="text-slate-950 font-semibold">{dep.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-700">Parentesco</p>
                            <p className="text-slate-950 font-semibold">{dep.relationship}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-700">Data de Nascimento</p>
                            <p className="text-slate-950 font-semibold">{dep.birth_date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-slate-300 bg-slate-50">
                    <p className="text-sm text-slate-600">Nenhum dependente cadastrado.</p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setIsEditOpen(true)
                        setEditTab('dependentes')
                      }}
                    >
                      Adicionar dependente
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Formação Acadêmica</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Nível de Escolaridade" value={employee.education_level} />
                  <Field label="Instituição" value={employee.institution} />
                  <Field label="Curso" value={employee.course} />
                  <Field label="Ano de Conclusão" value={employee.graduation_year} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificações e Idiomas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Certificações</p>
                    <div className="space-y-1">
                      {employee.certifications.length > 0 ? (
                        employee.certifications.map((cert, index) => (
                          <p key={index} className="text-slate-950 font-semibold flex items-center">
                            <Award className="h-3 w-3 mr-2 text-primary-500" />
                            {cert}
                          </p>
                        ))
                      ) : (
                        <p className="text-slate-700">-</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500 mb-2">Idiomas</p>
                    <div className="space-y-1">
                      {employee.languages.length > 0 ? (
                        employee.languages.map((lang, index) => (
                          <p key={index} className="text-slate-950 font-semibold">{lang}</p>
                        ))
                      ) : (
                        <p className="text-slate-700">-</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Informações Bancárias</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Field label="Banco" value={employee.bank || '-'} />
                <Field label="Agência" value={employee.agency || '-'} />
                <Field label="Conta" value={employee.account || '-'} />
                <Field label="Tipo de Conta" value={employee.account_type || '-'} />
                <Field label="Chave PIX" value={employee.pix_key || '-'} />
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-slate-400 mb-4">
                    <Activity className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Dados de Desempenho</h3>
                  <p className="text-slate-600 mb-4">
                    Os dados de desempenho serão exibidos aqui quando estiverem disponíveis.
                  </p>
                  <div className="text-sm text-slate-500">
                    <p>• Avaliações de desempenho</p>
                    <p>• Feedbacks e comentários</p>
                    <p>• Metas e objetivos</p>
                    <p>• Histórico de avaliações</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {employee.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-800">{employee.notes}</p>
          </CardContent>
        </Card>
      )}

      <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" onClick={() => setIsEditOpen(false)} />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none max-h-[95vh] w-[min(100vw-1rem,80rem)]"
            onPointerDownOutside={() => setIsEditOpen(false)}
            onInteractOutside={() => setIsEditOpen(false)}
            onEscapeKeyDown={() => setIsEditOpen(false)}
          >
            <div className="w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
              <div className="p-6 border-b border-slate-200 bg-white flex-shrink-0">
                <Dialog.Title className="text-lg font-semibold text-slate-900">Editar colaborador</Dialog.Title>
                <Dialog.Description className="text-sm text-slate-600 mt-1">
                  Edite as informações do colaborador.
                </Dialog.Description>
              </div>
              
              <div className="border-b border-slate-200 bg-white flex-shrink-0">
                <div className="lg:hidden px-4 py-2 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center justify-center text-xs font-medium text-slate-500">
                    <span className="flex items-center gap-1">
                      ← Deslize para ver mais abas →
                    </span>
                  </div>
                </div>
                
                <nav className="flex space-x-4 sm:space-x-6 lg:space-x-8 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
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
                      className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                        editTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-white" style={{ maxHeight: 'calc(95vh - 250px)', WebkitOverflowScrolling: 'touch' }}>
                <div className="p-6">
                {editTab === 'pessoal' && (
                  <div className="space-y-6">
                    
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {avatarPreview || (employee as any).avatar_url ? (
                          <img src={avatarPreview || withVersion((employee as any).avatar_url, employee.updated_at)} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-slate-500 text-sm">Sem foto</span>
                        )}
                      </div>
                      <div>
                        <Label>Foto de Perfil</Label>
                        <input type="file" accept="image/*" className="block mt-2 text-sm text-slate-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          setAvatarFile(f)
                          if (f) setAvatarPreview(URL.createObjectURL(f))
                        }} />
                        <div className="mt-3 flex items-center gap-2">
                          <Button variant="secondary" size="sm" onClick={startCamera}>Usar câmera</Button>
                          <Button variant="ghost" size="sm" onClick={() => { setAvatarFile(null); setAvatarPreview(null) }}>Limpar</Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-name">Nome completo</Label>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-cpf">CPF</Label>
                        <Input
                          id="edit-cpf"
                          placeholder="123.456.789-00"
                          value={editData.cpf}
                          onChange={handleCPFChange}
                          maxLength={14}
                          className={validationErrors.cpf ? 'border-red-500' : ''}
                        />
                        {validationErrors.cpf && (
                          <p className="text-red-500 text-sm">{validationErrors.cpf}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-rg">RG</Label>
                        <Input
                          id="edit-rg"
                          placeholder="12.345.678-9"
                          value={editData.rg}
                          onChange={handleRGChange}
                          maxLength={12}
                          className={validationErrors.rg ? 'border-red-500' : ''}
                        />
                        {validationErrors.rg && (
                          <p className="text-red-500 text-sm">{validationErrors.rg}</p>
                        )}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-gender">Gênero</Label>
                        <select
                          id="edit-gender"
                          value={editData.gender}
                          onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 appearance-none"
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
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 appearance-none"
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
                      <h4 className="text-sm font-medium text-slate-800">Contatos</h4>
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
                        <div className="space-y-2">
                          <Label htmlFor="edit-emergency-phone">Telefone de Emergência</Label>
                          <Input
                            id="edit-emergency-phone"
                            placeholder="(11) 98765-1234"
                            value={editData.contacts.emergency_phone || ''}
                            onChange={(e) => setEditData({ 
                              ...editData, 
                              contacts: { ...editData.contacts, emergency_phone: e.target.value }
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-slate-800">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-zip">CEP</Label>
                          <div className="relative">
                            <Input
                              id="edit-zip"
                              placeholder="01234-567"
                              value={editData.address.zip}
                              onChange={handleCEPChange}
                              maxLength={9}
                              className={validationErrors.cep ? 'border-red-500' : ''}
                            />
                            {isValidatingCEP && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                          {validationErrors.cep && (
                            <p className="text-red-500 text-sm">{validationErrors.cep}</p>
                          )}
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
                        <div className="space-y-2 md:col-span-2">
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
                        <select
                          id="edit-dept"
                          value={editData.department}
                          onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                          disabled={loadingDepartments}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <Label htmlFor="edit-admission">Início de Contrato</Label>
                        <Input
                          id="edit-admission"
                          type="date"
                          value={editData.admission_date}
                          onChange={(e) => setEditData({ ...editData, admission_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-status">Status do Colaborador</Label>
                        <select
                          id="edit-status"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 appearance-none"
                          value={(editData as any).is_active ? 'active' : 'inactive'}
                          onChange={(e) => setEditData({
                            ...editData,
                            is_active: e.target.value === 'active'
                          })}
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-contract">Tipo de Contrato</Label>
                        <select
                          id="edit-contract"
                          value={editData.contract_type}
                          onChange={(e) => setEditData({ ...editData, contract_type: e.target.value })}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 appearance-none"
                        >
                          <option value="">Selecione</option>
                          <option value="CLT">CLT (Regime CLT)</option>
                          <option value="PJ">PJ (Pessoa Jurídica)</option>
                          <option value="Estagiário">Estagiário</option>
                          <option value="Temporário">Temporário</option>
                          <option value="Aprendiz">Aprendiz</option>
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

                {editTab === 'documentos' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>RG (Frente)</Label>
                          {(employee as any).rg_photo && (
                            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleRemoveDocument('rg_photo')}>Remover</button>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="block w-full text-sm text-slate-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-xl p-1" onChange={(e) => setDocFiles(prev => ({ ...prev, rg: e.target.files?.[0] }))} />
                        {docFiles.rg && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-600 mb-1">Pré-visualização</p>
                            <img src={URL.createObjectURL(docFiles.rg)} alt="RG Frente Preview" className="w-full h-24 object-cover rounded-lg border border-slate-300" />
                          </div>
                        )}
                        {(employee as any).rg_photo && (
                          <p className="text-xs text-slate-600 mt-1 truncate">Salvo: {(employee as any).rg_photo.split('/').pop()}</p>
                        )}
                        <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>RG (Verso)</Label>
                          {(employee as any).rg_back_photo && (
                            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleRemoveDocument('rg_back_photo')}>Remover</button>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="block w-full text-sm text-slate-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-xl p-1" onChange={(e) => setDocFiles(prev => ({ ...prev, rg_back: e.target.files?.[0] }))} />
                        {docFiles.rg_back && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-600 mb-1">Pré-visualização</p>
                            <img src={URL.createObjectURL(docFiles.rg_back)} alt="RG Verso Preview" className="w-full h-24 object-cover rounded-lg border border-slate-300" />
                          </div>
                        )}
                        {(employee as any).rg_back_photo && (
                          <p className="text-xs text-slate-600 mt-1 truncate">Salvo: {(employee as any).rg_back_photo.split('/').pop()}</p>
                        )}
                        </div>
              </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>CPF (Frente)</Label>
                          {(employee as any).cpf_photo && (
                            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleRemoveDocument('cpf_photo')}>Remover</button>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="block w-full text-sm text-slate-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-xl p-1" onChange={(e) => setDocFiles(prev => ({ ...prev, cpf: e.target.files?.[0] }))} />
                        {docFiles.cpf && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-600 mb-1">Pré-visualização</p>
                            <img src={URL.createObjectURL(docFiles.cpf)} alt="CPF Frente Preview" className="w-full h-24 object-cover rounded-lg border border-slate-300" />
                          </div>
                        )}
                        {(employee as any).cpf_photo && (
                          <p className="text-xs text-slate-600 mt-1 truncate">Salvo: {(employee as any).cpf_photo.split('/').pop()}</p>
                        )}
                        <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>CPF (Verso)</Label>
                          {(employee as any).cpf_back_photo && (
                            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleRemoveDocument('cpf_back_photo')}>Remover</button>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="block w-full text-sm text-slate-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-xl p-1" onChange={(e) => setDocFiles(prev => ({ ...prev, cpf_back: e.target.files?.[0] }))} />
                        {docFiles.cpf_back && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-600 mb-1">Pré-visualização</p>
                            <img src={URL.createObjectURL(docFiles.cpf_back)} alt="CPF Verso Preview" className="w-full h-24 object-cover rounded-lg border border-slate-300" />
                          </div>
                        )}
                        {(employee as any).cpf_back_photo && (
                          <p className="text-xs text-slate-600 mt-1 truncate">Salvo: {(employee as any).cpf_back_photo.split('/').pop()}</p>
                        )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Foto da CTPS</Label>
                          {(employee as any).ctps_photo && (
                            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleRemoveDocument('ctps_photo')}>Remover</button>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="block w-full text-sm text-slate-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-xl p-1" onChange={(e) => setDocFiles(prev => ({ ...prev, ctps: e.target.files?.[0] }))} />
                        {docFiles.ctps && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-600 mb-1">Pré-visualização</p>
                            <img src={URL.createObjectURL(docFiles.ctps)} alt="CTPS Preview" className="w-full h-24 object-cover rounded-lg border border-slate-300" />
                          </div>
                        )}
                        {(employee as any).ctps_photo && (
                          <p className="text-xs text-slate-600 mt-1 truncate">Salvo: {(employee as any).ctps_photo.split('/').pop()}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Foto do Diploma</Label>
                          {(employee as any).diploma_photo && (
                            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleRemoveDocument('diploma_photo')}>Remover</button>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="block w-full text-sm text-slate-900 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 border border-slate-300 rounded-xl p-1" onChange={(e) => setDocFiles(prev => ({ ...prev, diploma: e.target.files?.[0] }))} />
                        {docFiles.diploma && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-600 mb-1">Pré-visualização</p>
                            <img src={URL.createObjectURL(docFiles.diploma)} alt="Diploma Preview" className="w-full h-24 object-cover rounded-lg border border-slate-300" />
                          </div>
                        )}
                        {(employee as any).diploma_photo && (
                          <p className="text-xs text-slate-600 mt-1 truncate">Salvo: {(employee as any).diploma_photo.split('/').pop()}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">Selecione os arquivos. Eles serão enviados ao salvar.</p>
                  </div>
                )}

                {editTab === 'beneficios' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Plano de Saúde</Label>
                        <select 
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 appearance-none" 
                          value={(editData as any).benefits?.health_plan || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            benefits: {
                              ...(editData as any).benefits,
                              health_plan: e.target.value === 'true'
                            }
                          })}
                        >
                          <option value="">Selecione</option>
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Plano Odontológico</Label>
                        <select 
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 appearance-none" 
                          value={(editData as any).benefits?.dental_plan || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            benefits: {
                              ...(editData as any).benefits,
                              dental_plan: e.target.value === 'true'
                            }
                          })}
                        >
                          <option value="">Selecione</option>
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Vale Refeição (R$)</Label>
                        <Input 
                          placeholder="0,00" 
                          value={(editData as any).benefits?.meal_voucher || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            benefits: {
                              ...(editData as any).benefits,
                              meal_voucher: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Vale Transporte (R$)</Label>
                        <Input 
                          placeholder="0,00" 
                          value={(editData as any).benefits?.transport_voucher || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            benefits: {
                              ...(editData as any).benefits,
                              transport_voucher: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editTab === 'dependentes' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-slate-800">Dependentes</h4>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if ((editData.dependents || []).length >= 3) return
                          setEditData({
                            ...editData,
                            dependents: [...(editData.dependents || []), { name: '', relationship: '', birth_date: '' }],
                          })
                        }}
                        disabled={(editData.dependents || []).length >= 3}
                      >
                        Adicionar
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {(editData.dependents || []).map((dep, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-slate-600">Dependente {idx + 1}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const next = [...editData.dependents]
                                next.splice(idx, 1)
                                setEditData({ ...editData, dependents: next })
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Nome</Label>
                              <Input
                                placeholder="Maria da Silva"
                                value={dep.name}
                                onChange={(e) => {
                                  const next = [...editData.dependents]
                                  next[idx] = { ...next[idx], name: e.target.value }
                                  setEditData({ ...editData, dependents: next })
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Parentesco</Label>
                              <Input
                                placeholder="Filho(a) / Cônjuge / etc."
                                value={dep.relationship}
                                onChange={(e) => {
                                  const next = [...editData.dependents]
                                  next[idx] = { ...next[idx], relationship: e.target.value }
                                  setEditData({ ...editData, dependents: next })
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Data de Nascimento</Label>
                              <Input
                                type="date"
                                value={dep.birth_date}
                                onChange={(e) => {
                                  const next = [...editData.dependents]
                                  next[idx] = { ...next[idx], birth_date: e.target.value }
                                  setEditData({ ...editData, dependents: next })
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {(editData.dependents || []).length === 0 && (
                        <p className="text-sm text-slate-600">Nenhum dependente adicionado. Clique em "Adicionar" para incluir até 3.</p>
                      )}
                    </div>
                  </div>
                )}

                {editTab === 'formacao' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Nível</Label>
                        <Input 
                          placeholder="Ensino Superior" 
                          value={(editData as any).education?.level || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            education: {
                              ...(editData as any).education,
                              level: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Curso</Label>
                        <Input 
                          placeholder="Administração" 
                          value={(editData as any).education?.course || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            education: {
                              ...(editData as any).education,
                              course: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Instituição</Label>
                        <Input 
                          placeholder="Universidade" 
                          value={(editData as any).education?.institution || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            education: {
                              ...(editData as any).education,
                              institution: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ano de Conclusão</Label>
                        <Input 
                          placeholder="2022" 
                          value={(editData as any).education?.graduation_year || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            education: {
                              ...(editData as any).education,
                              graduation_year: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editTab === 'bancario' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Banco</Label>
                        <Input 
                          placeholder="Banco" 
                          value={(editData as any).bank?.bank_name || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            bank: {
                              ...(editData as any).bank,
                              bank_name: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Agência</Label>
                        <Input 
                          placeholder="0001" 
                          value={(editData as any).bank?.agency || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            bank: {
                              ...(editData as any).bank,
                              agency: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Conta</Label>
                        <Input 
                          placeholder="123456-7" 
                          value={(editData as any).bank?.account || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            bank: {
                              ...(editData as any).bank,
                              account: e.target.value
                            }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Conta</Label>
                        <select 
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 appearance-none" 
                          value={(editData as any).bank?.account_type || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            bank: {
                              ...(editData as any).bank,
                              account_type: e.target.value
                            }
                          })}
                        >
                          <option value="">Selecione</option>
                          <option value="Corrente">Corrente</option>
                          <option value="Poupança">Poupança</option>
                          <option value="Salário">Salário</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Chave PIX</Label>
                        <Input 
                          placeholder="CPF, e-mail, telefone ou chave aleatória" 
                          value={(editData as any).bank?.pix_key || ''} 
                          onChange={(e) => setEditData({
                            ...editData,
                            bank: {
                              ...(editData as any).bank,
                              pix_key: e.target.value
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
              
              <div className="p-4 sm:p-6 border-t border-slate-200 bg-white flex items-center justify-end gap-2 flex-shrink-0 sticky bottom-0 z-10 shadow-lg backdrop-blur-sm">
                <Dialog.Close asChild>
                  <Button variant="ghost" className="min-h-[44px] px-4">Cancelar</Button>
                </Dialog.Close>
                <Button variant="primary" className="!bg-[#1B263B] min-h-[44px] px-4" disabled={saving} onClick={handleSaveEdit} type="button">
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      
      <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 outline-none">
            <div className="w-[min(100vw-2rem,28rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-white">
                <Dialog.Title className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  Excluir Colaborador
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-600 mt-1">
                  Esta ação não pode ser desfeita.
                </Dialog.Description>
              </div>
              
              <div className="p-6 bg-white">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-900 font-medium">
                      Tem certeza que deseja excluir o colaborador?
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>{employee?.full_name}</strong> será permanentemente removido do sistema.
                    </p>
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Atenção:</strong> Todos os dados relacionados a este colaborador serão perdidos, incluindo:
                      </p>
                      <ul className="text-sm text-red-700 mt-2 ml-4 list-disc">
                        <li>Informações pessoais e profissionais</li>
                        <li>Documentos e fotos</li>
                        <li>Histórico de avaliações</li>
                        <li>Feedbacks e comentários</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
                <Dialog.Close asChild>
                  <Button variant="ghost" disabled={deleting}>
                    Cancelar
                  </Button>
                </Dialog.Close>
                <Button 
                  variant="destructive" 
                  disabled={deleting} 
                  onClick={handleDeleteEmployee}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Colaborador
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}