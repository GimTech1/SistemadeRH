'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  Package,
  Calendar,
  User,
  FileText,
  Users,
  Edit,
  ArrowLeft,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Tag,
  DollarSign,
  Building,
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface Delivery {
  id: string
  title: string
  description: string
  deliveryDate: string
  status: 'completed' | 'in_progress' | 'pending'
  responsible: string
  documentation: string[]
  training: {
    provided: boolean
    trainedPeople: string[]
    trainingDate?: string
  }
  updates: {
    date: string
    description: string
    author: string
  }[]
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  projectType: string
  client?: string
  budget?: number
  createdAt: string
}

interface Employee {
  id: string
  full_name: string
  position: string
  department: string
}

export default function DeliveryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Delivery>>({})
  const [newUpdate, setNewUpdate] = useState({ description: '', author: '' })
  const [newDocument, setNewDocument] = useState('')
  const [newTrainedPerson, setNewTrainedPerson] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'gerente' | 'employee'>('employee')
  const supabase: SupabaseClient<Database> = createClient()

  // Carregar informações do usuário e verificar permissões
  const loadUserInfo = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) return

      const role = (profile as any).role?.toLowerCase() || 'employee'
      setUserRole(role === 'admin' || role === 'administrador' ? 'admin' : 
                 role === 'gerente' || role === 'manager' ? 'gerente' : 'employee')
    } catch (error) {
      console.error('Erro ao carregar informações do usuário:', error)
    }
  }

  // Carregar funcionários
  const loadEmployees = async () => {
    try {
      setLoadingEmployees(true)
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data.employees || [])
      } else {
        console.error('Erro ao carregar funcionários')
        toast.error('Erro ao carregar lista de funcionários')
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)
      toast.error('Erro ao carregar lista de funcionários')
    } finally {
      setLoadingEmployees(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const validFiles = Array.from(files).filter(file => {
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ]
        const maxSize = 50 * 1024 * 1024 // 50MB
        
        if (!allowedTypes.includes(file.type)) {
          toast.error(`Arquivo ${file.name} não é um formato válido.`)
          return false
        }
        
        if (file.size > maxSize) {
          toast.error(`Arquivo ${file.name} é muito grande. Tamanho máximo: 50MB.`)
          return false
        }
        
        return true
      })

      setUploadedFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return

    try {
      setUploading(true)
      
      for (const file of uploadedFiles) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('delivery_id', delivery!.id)
        formData.append('description', `Documento anexado: ${file.name}`)

        const uploadResponse = await fetch('/api/deliveries/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          console.error('Erro ao fazer upload do arquivo:', error)
          toast.error(`Erro ao fazer upload de ${file.name}`)
        } else {
          toast.success(`Arquivo ${file.name} enviado com sucesso!`)
        }
      }

      // Recarregar a entrega para mostrar os novos documentos
      const response = await fetch(`/api/deliveries/${delivery!.id}`)
      if (response.ok) {
        const data = await response.json()
        setDelivery(data.delivery)
        setEditForm(data.delivery)
      }

      setUploadedFiles([])
    } catch (error) {
      console.error('Erro ao fazer upload dos arquivos:', error)
      toast.error('Erro ao fazer upload dos arquivos')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    const loadDelivery = async () => {
      try {
        const deliveryId = params.id as string
        const response = await fetch(`/api/deliveries/${deliveryId}`)
        
        if (response.ok) {
          const data = await response.json()
          setDelivery(data.delivery)
          setEditForm(data.delivery)
        } else {
          toast.error('Entrega não encontrada')
          router.push('/deliveries')
          return
        }
        
        // Verificar se deve abrir em modo de edição
        const editParam = searchParams.get('edit')
        if (editParam === 'true') {
          setIsEditing(true)
        }
      } catch (error) {
        console.error('Erro ao carregar entrega:', error)
        toast.error('Erro ao carregar entrega')
        router.push('/deliveries')
      } finally {
        setLoading(false)
      }
    }

    loadDelivery()
    loadEmployees() // Carregar funcionários também
    loadUserInfo() // Carregar informações do usuário
  }, [params.id, router, searchParams])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/deliveries/${delivery?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const data = await response.json()
        setDelivery(data.delivery)
        toast.success('Entrega atualizada com sucesso!')
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao atualizar entrega')
      }
    } catch (error) {
      console.error('Erro ao salvar alterações:', error)
      toast.error('Erro ao salvar alterações')
    }
  }

  const handleAddUpdate = () => {
    if (!newUpdate.description.trim() || !newUpdate.author.trim()) {
      toast.error('Preencha todos os campos da atualização')
      return
    }

    const update = {
      ...newUpdate,
      date: new Date().toISOString().split('T')[0]
    }

    setEditForm(prev => ({
      ...prev,
      updates: [...(prev.updates || []), update]
    }))

    setNewUpdate({ description: '', author: '' })
    toast.success('Atualização adicionada!')
  }

  const handleAddDocument = () => {
    if (!newDocument.trim()) {
      toast.error('Digite o nome do documento')
      return
    }

    setEditForm(prev => ({
      ...prev,
      documentation: [...(prev.documentation || []), newDocument]
    }))

    setNewDocument('')
    toast.success('Documento adicionado!')
  }

  const handleAddTrainedPerson = () => {
    if (!newTrainedPerson.trim()) {
      toast.error('Digite o nome da pessoa treinada')
      return
    }

    setEditForm(prev => ({
      ...prev,
      training: {
        ...prev.training!,
        trainedPeople: [...(prev.training?.trainedPeople || []), newTrainedPerson]
      }
    }))

    setNewTrainedPerson('')
    toast.success('Pessoa adicionada à lista de treinados!')
  }

  const handleRemoveDocument = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      documentation: prev.documentation?.filter((_, i) => i !== index) || []
    }))
  }

  const handleRemoveTrainedPerson = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      training: {
        ...prev.training!,
        trainedPeople: prev.training?.trainedPeople?.filter((_, i) => i !== index) || []
      }
    }))
  }

  const handleDownloadDocument = async (document: any) => {
    if (typeof document === 'object' && document.id) {
      try {
        // Buscar URL assinada da API
        const response = await fetch(`/api/deliveries/download?documentId=${document.id}`)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Erro ao gerar URL de download')
        }

        const { downloadUrl, filename } = await response.json()
        
        // Criar um link temporário para download
        const link = window.document.createElement('a')
        link.href = downloadUrl
        link.download = filename || document.filename
        link.target = '_blank'
        window.document.body.appendChild(link)
        link.click()
        window.document.body.removeChild(link)
      } catch (error) {
        console.error('Erro ao fazer download:', error)
        toast.error((error as Error).message || 'Erro ao fazer download do documento')
      }
    } else {
      toast.error('ID do documento não disponível')
    }
  }

  const handleDelete = async () => {
    if (!delivery) return

    try {
      setDeleting(true)
      
      const response = await fetch(`/api/deliveries/${delivery.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Entrega excluída com sucesso!')
        router.push('/deliveries')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Erro ao excluir entrega')
      }
    } catch (error) {
      console.error('Erro ao excluir entrega:', error)
      toast.error('Erro ao excluir entrega')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando entrega...</div>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Entrega não encontrada</div>
      </div>
    )
  }

  const currentDelivery = isEditing ? editForm : delivery

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/deliveries')}
            className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">
              {isEditing ? 'Editar Entrega' : 'Detalhes da Entrega'}
            </h1>
            <p className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">
              {isEditing ? 'Modifique as informações da entrega' : 'Visualize e gerencie os detalhes do projeto'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              {(userRole === 'admin' || userRole === 'gerente') && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-white px-4 py-2 rounded-lg font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                  style={{ backgroundColor: '#1B263B' }}
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </button>
              )}
              {(userRole === 'admin' || userRole === 'gerente') && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditForm(delivery)
                }}
                className="px-4 py-2 rounded-lg border border-platinum-300 text-oxford-blue-700 hover:bg-platinum-50 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="text-white px-4 py-2 rounded-lg font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                style={{ backgroundColor: '#1B263B' }}
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Título e Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full text-2xl font-roboto font-medium text-rich-black-900 bg-transparent border-b border-platinum-300 focus:border-yinmn-blue-500 focus:outline-none pb-2"
                    placeholder="Título do projeto"
                  />
                ) : (
                  <h2 className="text-2xl font-roboto font-medium text-rich-black-900 mb-2">
                    {delivery.title}
                  </h2>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-roboto font-medium border ${getStatusColor(currentDelivery?.status || '')}`}>
                    {getStatusIcon(currentDelivery?.status || '')}
                    {currentDelivery?.status === 'completed' ? 'Concluída' :
                     currentDelivery?.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-roboto font-medium border ${getPriorityColor(currentDelivery?.priority || '')}`}>
                    {currentDelivery?.priority === 'high' ? 'Alta' :
                     currentDelivery?.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-2">
                Descrição
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-32 p-3 border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent resize-none"
                  placeholder="Descreva o projeto..."
                />
              ) : (
                <p className="text-sm font-roboto font-light text-oxford-blue-600 leading-relaxed">
                  {delivery.description}
                </p>
              )}
            </div>
          </div>

          {/* Informações do Projeto */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <h3 className="text-lg font-roboto font-medium text-rich-black-900 mb-4">Informações do Projeto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                  Responsável
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={editForm.responsible || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, responsible: e.target.value }))}
                      className="w-full p-2 pr-10 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
                      style={{ backgroundImage: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                      disabled={loadingEmployees}
                    >
                      <option value="">
                        {loadingEmployees ? 'Carregando funcionários...' : 'Selecione um responsável'}
                      </option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.full_name}>
                          {employee.full_name} - {employee.position}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-oxford-blue-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-sm font-roboto font-light text-oxford-blue-600 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {delivery.responsible}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                  Data de Entrega
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editForm.deliveryDate || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className="w-full p-2 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm font-roboto font-light text-oxford-blue-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(delivery.deliveryDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                  Tipo de Projeto
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={editForm.projectType || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, projectType: e.target.value }))}
                      className="w-full p-2 pr-10 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
                      style={{ 
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      <option value="Desenvolvimento">Desenvolvimento</option>
                      <option value="Migração">Migração</option>
                      <option value="Integração">Integração</option>
                      <option value="Consultoria">Consultoria</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Modernização">Modernização</option>
                      <option value="Implementação">Implementação</option>
                      <option value="Customização">Customização</option>
                      <option value="Treinamento">Treinamento</option>
                      <option value="Auditoria">Auditoria</option>
                      <option value="Análise">Análise</option>
                      <option value="Pesquisa">Pesquisa</option>
                      <option value="Prototipagem">Prototipagem</option>
                      <option value="Testes">Testes</option>
                      <option value="Documentação">Documentação</option>
                      <option value="Suporte">Suporte</option>
                      <option value="Otimização">Otimização</option>
                      <option value="Segurança">Segurança</option>
                      <option value="Backup">Backup</option>
                      <option value="Recuperação">Recuperação</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-oxford-blue-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-sm font-roboto font-light text-oxford-blue-600 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {delivery.projectType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                  Cliente
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.client || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full p-2 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    placeholder="Nome do cliente"
                  />
                ) : (
                  <p className="text-sm font-roboto font-light text-oxford-blue-600 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {delivery.client || '—'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                  Orçamento
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editForm.budget || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full p-2 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    placeholder="Valor do orçamento"
                  />
                ) : (
                  <p className="text-sm font-roboto font-light text-oxford-blue-600 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    {delivery.budget ? formatCurrency(delivery.budget) : '—'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                  Status
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={editForm.status || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full p-2 pr-10 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
                      style={{ 
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluída</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-oxford-blue-400 pointer-events-none" />
                  </div>
                ) : (
                  <p className="text-sm font-roboto font-light text-oxford-blue-600 flex items-center gap-2">
                    {getStatusIcon(delivery.status)}
                    {delivery.status === 'completed' ? 'Concluída' :
                     delivery.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Documentação */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">Documentação</h3>
                <span className="text-sm text-oxford-blue-500">
                  ({currentDelivery?.documentation?.length || 0} documentos)
                </span>
              </div>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload-edit"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  />
                  <label
                    htmlFor="file-upload-edit"
                    className="px-3 py-1 border border-platinum-300 rounded-lg text-sm hover:bg-platinum-50 cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Selecionar Arquivos
                  </label>
                  {uploadedFiles.length > 0 && (
                    <button
                      onClick={uploadFiles}
                      disabled={uploading}
                      className="px-3 py-1 bg-yinmn-blue-600 text-white rounded-lg hover:bg-yinmn-blue-700 transition-colors text-sm font-roboto font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? 'Enviando...' : 'Enviar Arquivos'}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Lista de arquivos selecionados para upload */}
            {uploadedFiles.length > 0 && (
              <div className="mb-4 p-3 bg-platinum-50 rounded-lg">
                <h4 className="text-sm font-roboto font-medium text-rich-black-900 mb-2">Arquivos selecionados:</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-platinum-200 mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-oxford-blue-400" />
                      <div>
                        <span className="text-sm font-roboto font-medium text-rich-black-900">{file.name}</span>
                        <span className="text-xs font-roboto font-light text-oxford-blue-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {(currentDelivery?.documentation || []).map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-platinum-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-oxford-blue-400" />
                    <div>
                      <span className="text-sm font-roboto font-medium text-rich-black-900">
                        {typeof doc === 'string' ? doc : (doc as any).filename}
                      </span>
                      {typeof doc === 'object' && (doc as any).file_size && (
                        <span className="text-xs text-oxford-blue-500 ml-2">
                          ({((doc as any).file_size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-1 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded transition-colors"
                      title="Baixar documento"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveDocument(index)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {(!currentDelivery?.documentation || currentDelivery.documentation.length === 0) && (
                <p className="text-sm font-roboto font-light text-oxford-blue-400 text-center py-4">
                  Nenhum documento anexado
                </p>
              )}
            </div>
          </div>

          {/* Treinamento */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Treinamento</h3>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.training?.provided || false}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        training: { ...prev.training!, provided: e.target.checked }
                      }))}
                      className="rounded border-platinum-300 text-yinmn-blue-600 focus:ring-yinmn-blue-500"
                    />
                    <span className="text-sm font-roboto font-medium text-rich-black-900">Treinamento realizado</span>
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-oxford-blue-400" />
                <span className="text-sm font-roboto font-medium text-rich-black-900">
                  Treinamento {currentDelivery?.training?.provided ? 'Realizado' : 'Pendente'}
                </span>
              </div>

              {currentDelivery?.training?.provided && currentDelivery.training.trainingDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-oxford-blue-400" />
                  <span className="text-sm font-roboto font-light text-oxford-blue-600">
                    Data: {formatDate(currentDelivery.training.trainingDate)}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-2">
                  Pessoas Treinadas
                </label>
                {isEditing && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="relative flex-1">
                      <select
                        value={newTrainedPerson}
                        onChange={(e) => setNewTrainedPerson(e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-platinum-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
                        style={{ backgroundImage: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                        disabled={loadingEmployees}
                      >
                        <option value="">
                          {loadingEmployees ? 'Carregando funcionários...' : 'Selecione uma pessoa treinada'}
                        </option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.full_name}>
                            {employee.full_name} - {employee.position}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-oxford-blue-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={handleAddTrainedPerson}
                      className="p-2 text-yinmn-blue-600 hover:bg-yinmn-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="space-y-2">
                  {(currentDelivery?.training?.trainedPeople || []).map((person, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-platinum-50 rounded-lg">
                      <span className="text-sm font-roboto font-medium text-rich-black-900">{person}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveTrainedPerson(index)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(!currentDelivery?.training?.trainedPeople || currentDelivery.training.trainedPeople.length === 0) && (
                    <p className="text-sm font-roboto font-light text-oxford-blue-400 text-center py-2">
                      Nenhuma pessoa treinada
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Atualizações */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <h3 className="text-lg font-roboto font-medium text-rich-black-900 mb-4">Atualizações</h3>
            
            {isEditing && (
              <div className="mb-4 p-4 bg-platinum-50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                      Nova Atualização
                    </label>
                    <textarea
                      value={newUpdate.description}
                      onChange={(e) => setNewUpdate(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-platinum-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent resize-none"
                      placeholder="Descreva a atualização..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                      Autor
                    </label>
                    <div className="relative">
                      <select
                        value={newUpdate.author}
                        onChange={(e) => setNewUpdate(prev => ({ ...prev, author: e.target.value }))}
                        className="w-full p-2 pr-10 border border-platinum-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
                        style={{ backgroundImage: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                        disabled={loadingEmployees}
                      >
                        <option value="">
                          {loadingEmployees ? 'Carregando funcionários...' : 'Selecione o autor'}
                        </option>
                        {employees.map((employee) => (
                          <option key={employee.id} value={employee.full_name}>
                            {employee.full_name} - {employee.position}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-oxford-blue-400 pointer-events-none" />
                    </div>
                  </div>
                  <button
                    onClick={handleAddUpdate}
                    className="px-4 py-2 bg-yinmn-blue-600 text-white rounded-lg hover:bg-yinmn-blue-700 transition-colors text-sm font-roboto font-medium"
                  >
                    Adicionar Atualização
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {(currentDelivery?.updates || []).map((update, index) => (
                <div key={index} className="p-4 bg-platinum-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-oxford-blue-400" />
                      <span className="text-sm font-roboto font-medium text-rich-black-900">
                        {formatDate(update.date)}
                      </span>
                    </div>
                    <span className="text-xs font-roboto font-light text-oxford-blue-500">
                      por {update.author}
                    </span>
                  </div>
                  <p className="text-sm font-roboto font-light text-oxford-blue-600">
                    {update.description}
                  </p>
                </div>
              ))}
              {(!currentDelivery?.updates || currentDelivery.updates.length === 0) && (
                <p className="text-sm font-roboto font-light text-oxford-blue-400 text-center py-4">
                  Nenhuma atualização registrada
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tags */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <h3 className="text-lg font-roboto font-medium text-rich-black-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(currentDelivery?.tags || []).map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6">
            <h3 className="text-lg font-roboto font-medium text-rich-black-900 mb-4">Resumo</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-roboto font-medium text-oxford-blue-500">Documentos:</span>
                <span className="text-sm font-roboto font-light text-rich-black-900">
                  {currentDelivery?.documentation?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-roboto font-medium text-oxford-blue-500">Atualizações:</span>
                <span className="text-sm font-roboto font-light text-rich-black-900">
                  {currentDelivery?.updates?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-roboto font-medium text-oxford-blue-500">Treinados:</span>
                <span className="text-sm font-roboto font-light text-rich-black-900">
                  {currentDelivery?.training?.trainedPeople?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-roboto font-medium text-oxford-blue-500">Criado em:</span>
                <span className="text-sm font-roboto font-light text-rich-black-900">
                  {formatDate(delivery.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-roboto font-medium text-rich-black-900">
                  Excluir Entrega
                </h3>
                <p className="text-sm font-roboto font-light text-oxford-blue-600">
                  Esta ação não pode ser desfeita
                </p>
              </div>
            </div>
            
            <p className="text-sm font-roboto font-light text-rich-black-700 mb-6">
              Tem certeza que deseja excluir a entrega <strong>"{delivery?.title}"</strong>? 
              Todos os dados relacionados serão permanentemente removidos.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-platinum-300 text-oxford-blue-700 hover:bg-platinum-50 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
