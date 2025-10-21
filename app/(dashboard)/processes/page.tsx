'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Workflow,
  Calendar,
  User,
  Filter,
  Download,
  Upload,
  ArrowLeft
} from 'lucide-react'
import ProcessFlowEditor from '@/components/processes/ProcessFlowEditor'
import ProcessViewer from '@/components/processes/ProcessViewer'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface Process {
  id: string
  title: string
  description: string | null
  category: string
  status: 'draft' | 'published' | 'archived'
  created_by: string
  created_at: string
  updated_at: string
  flow_data: any
  department_id: string | null
  is_public: boolean
}

interface ProcessFormData {
  title: string
  description: string
  category: string
  department_id: string | null
  is_public: boolean
  flow_data: any
}

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProcess, setEditingProcess] = useState<Process | null>(null)
  const [departments, setDepartments] = useState<any[]>([])
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'employee'>('employee')
  const [userId, setUserId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [viewingProcess, setViewingProcess] = useState<Process | null>(null)
  const [editingFlow, setEditingFlow] = useState(false)
  
  const supabase: SupabaseClient<Database> = createClient()

  const [formData, setFormData] = useState<ProcessFormData>({
    title: '',
    description: '',
    category: '',
    department_id: null,
    is_public: true,
    flow_data: null
  })

  const categories = [
    'Recursos Humanos',
    'Financeiro',
    'Operacional',
    'Comercial',
    'Tecnologia',
    'Qualidade',
    'Outros'
  ]

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'draft', label: 'Rascunho' },
    { value: 'published', label: 'Publicado' },
    { value: 'archived', label: 'Arquivado' }
  ]

  useEffect(() => {
    loadUserData()
    loadProcesses()
    loadDepartments()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        const role = profile.role === 'admin' || profile.role === 'gerente' ? 
          (profile.role === 'admin' ? 'admin' : 'manager') : 'employee'
        setUserRole(role)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    }
  }

  const loadProcesses = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('processes')
        .select(`
          *,
          departments(name),
          profiles!processes_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })

      // Filtros baseados no papel do usuário
      if (userRole === 'employee') {
        query = query.eq('is_public', true).eq('status', 'published')
      }

      const { data, error } = await query

      if (error) throw error

      setProcesses(data || [])
    } catch (error) {
      console.error('Erro ao carregar processos:', error)
      toast.error('Erro ao carregar processos')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error)
    }
  }

  const handleCreateProcess = async () => {
    try {
      if (!formData.title.trim()) {
        toast.error('Título é obrigatório')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('processes')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          department_id: formData.department_id,
          is_public: formData.is_public,
          flow_data: formData.flow_data,
          created_by: user.id,
          status: 'draft'
        })

      if (error) throw error

      toast.success('Processo criado com sucesso')
      setCurrentView('list')
      setFormData({
        title: '',
        description: '',
        category: '',
        department_id: null,
        is_public: true,
        flow_data: null
      })
      loadProcesses()
    } catch (error) {
      console.error('Erro ao criar processo:', error)
      toast.error('Erro ao criar processo')
    }
  }

  const handleEditProcess = async () => {
    try {
      if (!editingProcess || !formData.title.trim()) {
        toast.error('Título é obrigatório')
        return
      }

      const { error } = await supabase
        .from('processes')
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          department_id: formData.department_id,
          is_public: formData.is_public,
          flow_data: formData.flow_data,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProcess.id)

      if (error) throw error

      toast.success('Processo atualizado com sucesso')
      setCurrentView('list')
      setEditingProcess(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        department_id: null,
        is_public: true,
        flow_data: null
      })
      loadProcesses()
    } catch (error) {
      console.error('Erro ao atualizar processo:', error)
      toast.error('Erro ao atualizar processo')
    }
  }

  const handleDeleteProcess = async (processId: string) => {
    if (!confirm('Tem certeza que deseja excluir este processo?')) return

    try {
      const { error } = await supabase
        .from('processes')
        .delete()
        .eq('id', processId)

      if (error) throw error

      toast.success('Processo excluído com sucesso')
      loadProcesses()
    } catch (error) {
      console.error('Erro ao excluir processo:', error)
      toast.error('Erro ao excluir processo')
    }
  }

  const handlePublishProcess = async (processId: string) => {
    try {
      const { error } = await supabase
        .from('processes')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', processId)

      if (error) throw error

      toast.success('Processo publicado com sucesso')
      loadProcesses()
    } catch (error) {
      console.error('Erro ao publicar processo:', error)
      toast.error('Erro ao publicar processo')
    }
  }

  const openEditModal = (process: Process) => {
    setEditingProcess(process)
    setFormData({
      title: process.title,
      description: process.description || '',
      category: process.category,
      department_id: process.department_id,
      is_public: process.is_public,
      flow_data: process.flow_data
    })
    setCurrentView('edit')
  }

  const handleViewProcess = (process: Process) => {
    setViewingProcess(process)
    setCurrentView('view')
  }

  const handleEditFlow = () => {
    setEditingFlow(true)
  }

  const handleSaveFlow = (flowData: any) => {
    setFormData(prev => ({ ...prev, flow_data: flowData }))
    setEditingFlow(false)
    toast.success('Fluxo salvo com sucesso')
  }

  const handleCancelFlow = () => {
    setEditingFlow(false)
  }

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (process.description && process.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !filterCategory || process.category === filterCategory
    const matchesStatus = !filterStatus || process.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const canEdit = (process: Process) => {
    return userRole === 'admin' || (userRole === 'manager' && process.created_by === userId)
  }

  const canDelete = (process: Process) => {
    return userRole === 'admin' || process.created_by === userId
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Visualização do processo
  if (currentView === 'view' && viewingProcess) {
    return (
      <ProcessViewer
        process={viewingProcess}
        onBack={() => setCurrentView('list')}
        canEdit={canEdit(viewingProcess)}
        onEdit={() => openEditModal(viewingProcess)}
      />
    )
  }

  // Editor de fluxo
  if (editingFlow) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleCancelFlow}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-xl font-bold">Editor de Fluxo</h1>
          </div>
        </div>
        <div className="flex-1">
          <ProcessFlowEditor
            initialData={formData.flow_data}
            onSave={handleSaveFlow}
            onCancel={handleCancelFlow}
          />
        </div>
      </div>
    )
  }

  // Formulário de criação/edição
  if (currentView === 'create' || currentView === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setCurrentView('list')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">
            {currentView === 'create' ? 'Criar Novo Processo' : 'Editar Processo'}
          </h1>
        </div>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nome do processo"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição do processo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <div className="relative">
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: 'none',
                        background: 'white'
                      }}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">Departamento</Label>
                  <div className="relative">
                    <select
                      id="department"
                      value={formData.department_id || ''}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value || null })}
                      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: 'none',
                        background: 'white'
                      }}
                    >
                      <option value="">Selecione um departamento</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="mr-2"
              />
              <Label htmlFor="is_public">Processo público (visível para todos os colaboradores)</Label>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentView('list')}
              >
                Cancelar
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleEditFlow}
                  disabled={!formData.title.trim()}
                >
                  <Workflow className="w-4 h-4 mr-2" />
                  Editar Fluxo
                </Button>
                
                <Button
                  onClick={currentView === 'create' ? handleCreateProcess : handleEditProcess}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.title.trim()}
                >
                  {currentView === 'create' ? 'Criar Processo' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processos</h1>
          <p className="text-gray-600">Gerencie e visualize os processos da empresa</p>
        </div>
        
        {(userRole === 'admin' || userRole === 'manager') && (
          <Button 
            onClick={() => setCurrentView('create')}
            className="text-white"
            style={{ backgroundColor: '#1b263b' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f172a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1b263b'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Buscar processos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="category">Categoria</Label>
            <div className="relative">
              <select
                id="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: 'none',
                  background: 'white'
                }}
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <div className="relative">
              <select
                id="status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: 'none',
                  background: 'white'
                }}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setFilterCategory('')
                setFilterStatus('')
              }}
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Processos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProcesses.map((process) => (
          <Card key={process.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Workflow className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="font-semibold text-gray-900">{process.title}</h3>
                  <p className="text-sm text-gray-500">{process.category}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                {process.status === 'published' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Publicado
                  </span>
                )}
                {process.status === 'draft' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Rascunho
                  </span>
                )}
                {process.status === 'archived' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Arquivado
                  </span>
                )}
              </div>
            </div>

            {process.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {process.description}
              </p>
            )}

            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Calendar className="w-4 h-4 mr-1" />
              <span>
                {new Date(process.created_at).toLocaleDateString('pt-BR')}
              </span>
              <User className="w-4 h-4 ml-4 mr-1" />
              <span>
                {process.profiles?.full_name || 'Usuário'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewProcess(process)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Visualizar
              </Button>

              <div className="flex items-center space-x-2">
                {canEdit(process) && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(process)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    {process.status === 'draft' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePublishProcess(process.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Publicar
                      </Button>
                    )}
                  </>
                )}

                {canDelete(process) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteProcess(process.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProcesses.length === 0 && (
        <Card className="p-8 text-center">
          <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum processo encontrado
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory || filterStatus 
              ? 'Tente ajustar os filtros de busca'
              : 'Crie seu primeiro processo para começar'
            }
          </p>
        </Card>
      )}

    </div>
  )
}
