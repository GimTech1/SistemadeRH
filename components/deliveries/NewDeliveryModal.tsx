'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Save,
  Plus,
  Trash2,
  Calendar,
  User,
  FileText,
  Users,
  Tag,
  DollarSign,
  Building,
  ChevronDown,
  Upload,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface NewDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (delivery: any) => void
}

interface Employee {
  id: string
  full_name: string
  position: string
  department: string
}

export default function NewDeliveryModal({ isOpen, onClose, onSave }: NewDeliveryModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deliveryDate: '',
    status: 'pending' as 'completed' | 'in_progress' | 'pending',
    responsible: '',
    projectType: 'Desenvolvimento',
    client: '',
    budget: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    documentation: [] as string[],
    training: {
      provided: false,
      trainedPeople: [] as string[],
      trainingDate: ''
    },
    updates: [] as Array<{ date: string; description: string; author: string }>,
    tags: [] as string[]
  })

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [newDocument, setNewDocument] = useState('')
  const [newTrainedPerson, setNewTrainedPerson] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newUpdate, setNewUpdate] = useState({ description: '', author: '' })

  // Carregar funcionários quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadEmployees()
    }
  }, [isOpen])

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

  const handleSave = async () => {
    // Validação básica
    if (!formData.title.trim() || !formData.description.trim() || !formData.deliveryDate || !formData.responsible) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Prevenir duplo clique
    if (uploading || isSubmitting) {
      return
    }

    try {
      setUploading(true)
      setIsSubmitting(true)
      
      const deliveryData = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : undefined,
        training: {
          ...formData.training,
          trainingDate: formData.training.trainingDate || undefined
        }
      }

      // Primeiro, criar a entrega
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryData),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 409) {
          throw new Error('Já existe uma entrega com este título, data e responsável. Tente alterar o título, data ou responsável.')
        }
        throw new Error(error.error || 'Erro ao criar entrega')
      }

      const { delivery } = await response.json()

      // Se há arquivos para upload, fazer upload de cada um
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('delivery_id', delivery.id)
          formData.append('description', `Documento anexado: ${file.name}`)

          const uploadResponse = await fetch('/api/deliveries/upload', {
            method: 'POST',
            body: formData,
          })

          if (!uploadResponse.ok) {
            const error = await uploadResponse.json()
            console.error('Erro ao fazer upload do arquivo:', error)
            toast.error(`Erro ao fazer upload de ${file.name}: ${error.error || 'Erro desconhecido'}`)
          } else {
            console.log(`Upload de ${file.name} realizado com sucesso`)
          }
        }
      }

      toast.success('Entrega criada com sucesso!')
      onSave(delivery)
      onClose()
      resetForm()
    } catch (error) {
      console.error('Erro ao salvar entrega:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao criar entrega')
    } finally {
      setUploading(false)
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      deliveryDate: '',
      status: 'pending',
      responsible: '',
      projectType: 'Desenvolvimento',
      client: '',
      budget: '',
      priority: 'medium',
      documentation: [],
      training: {
        provided: false,
        trainedPeople: [],
        trainingDate: ''
      },
      updates: [],
      tags: []
    })
    setNewDocument('')
    setNewTrainedPerson('')
    setNewTag('')
    setNewUpdate({ description: '', author: '' })
    setUploadedFiles([])
  }

  const handleAddDocument = () => {
    if (!newDocument.trim()) {
      toast.error('Selecione um documento')
      return
    }
    setFormData(prev => ({
      ...prev,
      documentation: [...prev.documentation, newDocument]
    }))
    setNewDocument('')
  }

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documentation: prev.documentation.filter((_, i) => i !== index)
    }))
  }

  const handleAddTrainedPerson = () => {
    if (!newTrainedPerson.trim()) {
      toast.error('Selecione uma pessoa treinada')
      return
    }
    setFormData(prev => ({
      ...prev,
      training: {
        ...prev.training,
        trainedPeople: [...prev.training.trainedPeople, newTrainedPerson]
      }
    }))
    setNewTrainedPerson('')
  }

  const handleRemoveTrainedPerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      training: {
        ...prev.training,
        trainedPeople: prev.training.trainedPeople.filter((_, i) => i !== index)
      }
    }))
  }

  const handleAddTag = () => {
    if (!newTag.trim()) {
      toast.error('Digite uma tag')
      return
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }))
    setNewTag('')
  }

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleAddUpdate = () => {
    if (!newUpdate.description.trim() || !newUpdate.author.trim()) {
      toast.error('Preencha todos os campos da atualização')
      return
    }
    setFormData(prev => ({
      ...prev,
      updates: [...prev.updates, {
        ...newUpdate,
        date: new Date().toISOString().split('T')[0]
      }]
    }))
    setNewUpdate({ description: '', author: '' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl max-h-[85vh] bg-white rounded-2xl shadow-lg border border-platinum-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-platinum-200">
          <h2 className="text-xl font-roboto font-medium text-rich-black-900">
            Nova Entrega de Projeto
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Informações Básicas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Título do Projeto *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    placeholder="Digite o título do projeto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Data de Entrega *
                  </label>
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Responsável *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.responsible}
                      onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                      className="w-full p-3 pr-10 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
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
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Tipo de Projeto
                  </label>
                  <div className="relative">
                    <select
                      value={formData.projectType}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
                      className="w-full p-3 pr-10 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
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
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Cliente
                  </label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Orçamento
                  </label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    placeholder="Valor do orçamento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full p-3 pr-10 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
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
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Prioridade
                  </label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-3 pr-10 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
                      style={{ 
                        backgroundImage: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-oxford-blue-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                  Descrição *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-32 p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent resize-none"
                  placeholder="Descreva o projeto..."
                />
              </div>
            </div>

            {/* Documentação */}
            <div className="space-y-4">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Documentação</h3>
              
              {/* Upload de arquivos */}
              <div className="border-2 border-dashed border-platinum-300 rounded-lg p-6 text-center hover:border-yinmn-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="h-8 w-8 text-oxford-blue-400" />
                  <span className="text-sm font-roboto font-medium text-oxford-blue-600">
                    Clique para selecionar arquivos
                  </span>
                  <span className="text-xs font-roboto font-light text-oxford-blue-500">
                    PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, WEBP (máx. 50MB cada)
                  </span>
                </label>
              </div>

              {/* Lista de arquivos selecionados */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-roboto font-medium text-rich-black-900">Arquivos selecionados:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-platinum-50 rounded-lg">
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
            </div>

            {/* Treinamento */}
            <div className="space-y-4">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Treinamento</h3>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.training.provided}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    training: { ...prev.training, provided: e.target.checked }
                  }))}
                  className="rounded border-platinum-300 text-yinmn-blue-600 focus:ring-yinmn-blue-500"
                />
                <label className="text-sm font-roboto font-medium text-rich-black-900">
                  Treinamento foi realizado
                </label>
              </div>

              {formData.training.provided && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                      Data do Treinamento
                    </label>
                    <input
                      type="date"
                      value={formData.training.trainingDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        training: { ...prev.training, trainingDate: e.target.value }
                      }))}
                      className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={newTrainedPerson}
                        onChange={(e) => setNewTrainedPerson(e.target.value)}
                        className="w-full p-3 pr-10 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
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
                      className="p-3 text-yinmn-blue-600 hover:bg-yinmn-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.training.trainedPeople.map((person, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-platinum-50 rounded-lg">
                        <span className="text-sm font-roboto font-medium text-rich-black-900">{person}</span>
                        <button
                          onClick={() => handleRemoveTrainedPerson(index)}
                          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-4">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Tags</h3>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Digite uma tag"
                  className="flex-1 p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddTag}
                  className="p-3 text-yinmn-blue-600 hover:bg-yinmn-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-platinum-100 text-oxford-blue-700 rounded-full text-sm font-roboto font-medium">
                    <Tag className="h-3 w-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(index)}
                      className="ml-1 text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Atualizações */}
            <div className="space-y-4">
              <h3 className="text-lg font-roboto font-medium text-rich-black-900">Atualizações</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Nova Atualização
                  </label>
                  <textarea
                    value={newUpdate.description}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent resize-none"
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
                      className="w-full p-3 pr-10 border border-platinum-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent appearance-none bg-white no-native-select-arrow"
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

              <div className="space-y-2">
                {formData.updates.map((update, index) => (
                  <div key={index} className="p-3 bg-platinum-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-roboto font-medium text-rich-black-900">
                        {new Date(update.date).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs font-roboto font-light text-oxford-blue-500">
                        por {update.author}
                      </span>
                    </div>
                    <p className="text-sm font-roboto font-light text-oxford-blue-600">
                      {update.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-platinum-200 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-platinum-300 text-oxford-blue-700 hover:bg-platinum-50 transition-colors font-roboto font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={uploading || isSubmitting}
            className="px-6 py-3 rounded-lg text-white hover:opacity-90 transition-opacity flex items-center gap-2 font-roboto font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1B263B' }}
          >
            <Save className="h-4 w-4" />
            {uploading || isSubmitting ? 'Salvando...' : 'Salvar Entrega'}
          </button>
        </div>
      </div>
    </div>
  )
}
