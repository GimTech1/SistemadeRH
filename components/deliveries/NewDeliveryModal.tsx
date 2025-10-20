'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import toast from 'react-hot-toast'

interface NewDeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (delivery: any) => void
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

  const [newDocument, setNewDocument] = useState('')
  const [newTrainedPerson, setNewTrainedPerson] = useState('')
  const [newTag, setNewTag] = useState('')
  const [newUpdate, setNewUpdate] = useState({ description: '', author: '' })

  const handleSave = () => {
    // Validação básica
    if (!formData.title.trim() || !formData.description.trim() || !formData.deliveryDate || !formData.responsible) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const delivery = {
      ...formData,
      budget: formData.budget ? Number(formData.budget) : undefined,
      training: {
        ...formData.training,
        trainingDate: formData.training.trainingDate || undefined
      }
    }

    onSave(delivery)
    onClose()
    resetForm()
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
  }

  const handleAddDocument = () => {
    if (!newDocument.trim()) {
      toast.error('Digite o nome do documento')
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
      toast.error('Digite o nome da pessoa treinada')
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
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-lg border border-platinum-200 overflow-hidden">
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
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
                  <input
                    type="text"
                    value={formData.responsible}
                    onChange={(e) => setFormData(prev => ({ ...prev, responsible: e.target.value }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    placeholder="Nome do responsável"
                  />
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Tipo de Projeto
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectType: e.target.value }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  >
                    <option value="Desenvolvimento">Desenvolvimento</option>
                    <option value="Migração">Migração</option>
                    <option value="Integração">Integração</option>
                    <option value="Consultoria">Consultoria</option>
                  </select>
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
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-roboto font-medium text-oxford-blue-500 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
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
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newDocument}
                  onChange={(e) => setNewDocument(e.target.value)}
                  placeholder="Nome do documento"
                  className="flex-1 p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddDocument}
                  className="p-3 text-yinmn-blue-600 hover:bg-yinmn-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {formData.documentation.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-platinum-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-oxford-blue-400" />
                      <span className="text-sm font-roboto font-medium text-rich-black-900">{doc}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveDocument(index)}
                      className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
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
                    <input
                      type="text"
                      value={newTrainedPerson}
                      onChange={(e) => setNewTrainedPerson(e.target.value)}
                      placeholder="Nome da pessoa treinada"
                      className="flex-1 p-3 border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    />
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
                  <input
                    type="text"
                    value={newUpdate.author}
                    onChange={(e) => setNewUpdate(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full p-3 border border-platinum-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                    placeholder="Nome do autor"
                  />
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-platinum-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-platinum-300 text-oxford-blue-700 hover:bg-platinum-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg text-white hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{ backgroundColor: '#1B263B' }}
          >
            <Save className="h-4 w-4" />
            Salvar Entrega
          </button>
        </div>
      </div>
    </div>
  )
}
