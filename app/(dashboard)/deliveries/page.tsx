'use client'

import { useState, useEffect } from 'react'
import {
  Package,
  Search,
  Plus,
  Calendar,
  User,
  FileText,
  Users,
  Edit,
  Eye,
  Trash2,
  Filter,
  Download,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle,
  Grid3X3,
  List,
  Tag,
  Link as LinkIcon,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import NewDeliveryModal from '@/components/deliveries/NewDeliveryModal'

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

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedProjectType, setSelectedProjectType] = useState('all')
  const [sortBy, setSortBy] = useState('deliveryDate')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [isNewDeliveryOpen, setIsNewDeliveryOpen] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null)

  // Carregar entregas da API
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch('/api/deliveries')
        if (response.ok) {
          const data = await response.json()
          
          // Remover duplicatas baseado no ID
          const uniqueDeliveries = (data.deliveries || []).filter((delivery: any, index: number, self: any[]) => 
            index === self.findIndex((d: any) => d.id === delivery.id)
          )
          
          setDeliveries(uniqueDeliveries)
        } else {
          const errorData = await response.json()
          console.error('Erro ao carregar entregas:', errorData.error)
          // Só mostrar toast se for um erro real, não se for apenas falta de dados
          if (response.status >= 500) {
            toast.error('Erro interno do servidor')
          }
        }
      } catch (error) {
        console.error('Erro ao carregar entregas:', error)
        toast.error('Erro de conexão com o servidor')
      }
    }

    fetchDeliveries()
  }, [])

  const filteredDeliveries = deliveries
    .filter(delivery => {
      const matchesSearch = 
        delivery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = selectedStatus === 'all' || delivery.status === selectedStatus
      const matchesPriority = selectedPriority === 'all' || delivery.priority === selectedPriority
      const matchesProjectType = selectedProjectType === 'all' || delivery.projectType === selectedProjectType
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProjectType
    })
    .sort((a, b) => {
      if (sortBy === 'deliveryDate') return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime()
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (sortBy === 'status') return a.status.localeCompare(b.status)
      if (sortBy === 'priority') return a.priority.localeCompare(b.priority)
      return 0
    })

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

  const handleSaveNewDelivery = async (newDelivery: any) => {
    // A entrega já foi criada pelo modal, apenas atualizar a lista
    setDeliveries(prev => [...prev, newDelivery])
  }

  const projectTypes = ['all', ...new Set(deliveries.map(d => d.projectType))]
  const statuses = ['all', 'completed', 'in_progress', 'pending']
  const priorities = ['all', 'high', 'medium', 'low']

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">
          Registre, acompanhe e documente o progresso dos projetos finalizados
          </h1>
        </div>
        <button
          onClick={() => setIsNewDeliveryOpen(true)}
          className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          style={{ backgroundColor: '#1B263B' }}
        >
          <Plus className="h-4 w-4" />
          Nova Entrega
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Total de Entregas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">{deliveries.length}</p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">projetos registrados</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Concluídas</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {deliveries.filter(d => d.status === 'completed').length}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">entregas finalizadas</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Em Andamento</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {deliveries.filter(d => d.status === 'in_progress').length}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">projetos ativos</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 border-l-4 border-l-[#415A77]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-roboto font-medium text-oxford-blue-500 mb-1">Orçamento Total</p>
              <p className="text-3xl font-roboto font-semibold text-rich-black-900">
                {formatCurrency(deliveries.reduce((acc, d) => acc + (d.budget || 0), 0))}
              </p>
              <p className="text-xs font-roboto font-light text-oxford-blue-400 mt-1">investimento total</p>
            </div>
            <div className="w-12 h-12 bg-[#E0E1DD] rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#778DA9]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 sm:py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 placeholder-oxford-blue-400 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Buscar por título, descrição, responsável ou tags..."
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'Todos os Status' : 
                     status === 'completed' ? 'Concluídas' :
                     status === 'in_progress' ? 'Em Andamento' : 'Pendentes'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Prioridade:</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'Todas as Prioridades' : 
                     priority === 'high' ? 'Alta' :
                     priority === 'medium' ? 'Média' : 'Baixa'}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Tipo:</label>
              <select
                value={selectedProjectType}
                onChange={(e) => setSelectedProjectType(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                {projectTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Todos os Tipos' : type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Ordenar:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-platinum-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-xs sm:text-sm font-roboto font-medium text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
              >
                <option value="deliveryDate">Data de Entrega</option>
                <option value="title">Título</option>
                <option value="status">Status</option>
                <option value="priority">Prioridade</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">Visualizar:</label>
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

      {/* Lista de Entregas */}
      {filteredDeliveries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-12 text-center">
          <div className="w-16 h-16 bg-platinum-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-oxford-blue-400" />
          </div>
          <h3 className="text-lg font-roboto font-medium text-rich-black-900 mb-2">
            Nenhuma entrega encontrada
          </h3>
          <p className="text-sm font-roboto font-light text-oxford-blue-600 mb-6">
            {deliveries.length === 0 
              ? 'Comece criando sua primeira entrega de projeto.'
              : 'Tente ajustar os filtros para encontrar o que procura.'
            }
          </p>
          <button
            onClick={() => setIsNewDeliveryOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B263B] text-white rounded-lg hover:opacity-90 transition-opacity font-roboto font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            Nova Entrega
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-platinum-50 border-b border-platinum-200">
                <tr className="text-left text-xs font-roboto font-medium text-oxford-blue-500 uppercase tracking-wider">
                  <th className="px-3 sm:px-6 py-4 min-w-[200px]">Projeto</th>
                  <th className="px-3 sm:px-6 py-4 min-w-[120px]">Status</th>
                  <th className="px-3 sm:px-6 py-4 min-w-[120px]">Prioridade</th>
                  <th className="px-3 sm:px-6 py-4 min-w-[120px]">Responsável</th>
                  <th className="px-3 sm:px-6 py-4 min-w-[120px]">Data de Entrega</th>
                  <th className="px-3 sm:px-6 py-4 min-w-[100px]">Orçamento</th>
                  <th className="px-3 sm:px-6 py-4 text-center min-w-[100px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-200">
                {filteredDeliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-platinum-50 transition-colors">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-roboto font-medium text-rich-black-900 text-sm sm:text-base truncate">
                          {delivery.title}
                        </p>
                        <p className="text-xs sm:text-sm font-roboto font-light text-oxford-blue-600 truncate">
                          {delivery.projectType}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {delivery.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                              {tag}
                            </span>
                          ))}
                          {delivery.tags.length > 2 && (
                            <span className="text-xs text-oxford-blue-500">+{delivery.tags.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium border ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        {delivery.status === 'completed' ? 'Concluída' :
                         delivery.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium border ${getPriorityColor(delivery.priority)}`}>
                        {delivery.priority === 'high' ? 'Alta' :
                         delivery.priority === 'medium' ? 'Média' : 'Baixa'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">
                        {delivery.responsible}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">
                        {formatDate(delivery.deliveryDate)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="text-xs sm:text-sm font-roboto font-medium text-rich-black-900">
                        {delivery.budget ? formatCurrency(delivery.budget) : '—'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <Link href={`/deliveries/${delivery.id}`}>
                          <button className="p-1.5 sm:p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </Link>
                        <Link href={`/deliveries/${delivery.id}?edit=true`}>
                          <button className="p-1.5 sm:p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir esta entrega?')) {
                              toast.success('Funcionalidade de exclusão em desenvolvimento')
                            }
                          }}
                          className="p-1.5 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
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
          {filteredDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-6 hover:shadow-md transition-all duration-200">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-roboto font-medium text-rich-black-900 text-lg mb-1 truncate">
                    {delivery.title}
                  </h3>
                  <p className="text-sm font-roboto font-light text-oxford-blue-600 mb-2">
                    {delivery.projectType}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {delivery.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-roboto font-medium bg-platinum-100 text-oxford-blue-700">
                        {tag}
                      </span>
                    ))}
                    {delivery.tags.length > 3 && (
                      <span className="text-xs text-oxford-blue-500">+{delivery.tags.length - 3}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <Link href={`/deliveries/${delivery.id}`}>
                    <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <Link href={`/deliveries/${delivery.id}?edit=true`}>
                    <button className="p-2 text-oxford-blue-600 hover:text-yinmn-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200">
                      <Edit className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>

              {/* Status e Prioridade */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium border ${getStatusColor(delivery.status)}`}>
                  {getStatusIcon(delivery.status)}
                  {delivery.status === 'completed' ? 'Concluída' :
                   delivery.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-roboto font-medium border ${getPriorityColor(delivery.priority)}`}>
                  {delivery.priority === 'high' ? 'Alta' :
                   delivery.priority === 'medium' ? 'Média' : 'Baixa'}
                </span>
              </div>

              {/* Descrição */}
              <p className="text-sm font-roboto font-light text-oxford-blue-600 mb-4 line-clamp-3">
                {delivery.description}
              </p>

              {/* Informações do Projeto */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-oxford-blue-400" />
                  <span className="text-sm font-roboto font-medium text-rich-black-900">
                    {delivery.responsible}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-oxford-blue-400" />
                  <span className="text-sm font-roboto font-medium text-rich-black-900">
                    {formatDate(delivery.deliveryDate)}
                  </span>
                </div>

                {delivery.budget && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-oxford-blue-400" />
                    <span className="text-sm font-roboto font-medium text-rich-black-900">
                      {formatCurrency(delivery.budget)}
                    </span>
                  </div>
                )}

                {/* Documentação */}
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-oxford-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm font-roboto font-medium text-rich-black-900 block">
                      {delivery.documentation.length} documento(s)
                    </span>
                    <span className="text-xs font-roboto font-light text-oxford-blue-600">
                      {delivery.documentation.slice(0, 1).join(', ')}
                      {delivery.documentation.length > 1 && ` +${delivery.documentation.length - 1} mais`}
                    </span>
                  </div>
                </div>

                {/* Treinamento */}
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-oxford-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-sm font-roboto font-medium text-rich-black-900 block">
                      Treinamento {delivery.training.provided ? 'Realizado' : 'Pendente'}
                    </span>
                    {delivery.training.provided && delivery.training.trainedPeople.length > 0 && (
                      <span className="text-xs font-roboto font-light text-oxford-blue-600">
                        {delivery.training.trainedPeople.length} pessoa(s) treinada(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Atualizações */}
                {delivery.updates.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-oxford-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-roboto font-medium text-rich-black-900 block">
                        {delivery.updates.length} atualização(ões)
                      </span>
                      <span className="text-xs font-roboto font-light text-oxford-blue-600">
                        Última: {formatDate(delivery.updates[delivery.updates.length - 1].date)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Nova Entrega */}
      <NewDeliveryModal
        isOpen={isNewDeliveryOpen}
        onClose={() => setIsNewDeliveryOpen(false)}
        onSave={handleSaveNewDelivery}
      />
    </div>
  )
}
