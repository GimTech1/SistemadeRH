'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  BarChart3,
  Zap,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface SavedHour {
  id: string
  title: string
  description: string | null
  type: string
  hours_saved: number
  created_by: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
    email: string
  }
}

interface Stats {
  totalHours: number
  totalRecords: number
  byType: Record<string, { count: number; hours: number }>
  byMonth: Array<{ month: string; count: number; hours: number }>
}

const TYPES = ['Automação', 'Sistema', 'Processo', 'Integração', 'Otimização', 'Outro']

export default function SavedHoursPage() {
  const [records, setRecords] = useState<SavedHour[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [hasAccess, setHasAccess] = useState(true)
  const supabase = createClient()

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Automação',
    hours_saved: '',
  })

  useEffect(() => {
    checkAccess()
    fetchRecords()
    fetchStats()
  }, [])

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setHasAccess(false)
        return
      }

      const profileResult: any = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', user.id)
        .single()

      const profile = profileResult.data

      if (!profile || !profile.department_id) {
        setHasAccess(false)
        return
      }

      // Buscar nome do departamento
      const deptResult: any = await supabase
        .from('departments')
        .select('name')
        .eq('id', profile.department_id)
        .single()

      const dept = deptResult.data

      if (!dept || dept.name !== 'Tecnologia') {
        setHasAccess(false)
      }
    } catch (error) {
      console.error('Erro ao verificar acesso:', error)
      setHasAccess(false)
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/saved-hours')
      if (response.status === 403) {
        setHasAccess(false)
        return
      }
      if (!response.ok) {
        throw new Error('Erro ao buscar registros')
      }
      
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      console.error('Erro ao buscar registros:', error)
      toast.error('Erro ao carregar registros')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/saved-hours/stats')
      if (!response.ok) throw new Error('Erro ao buscar estatísticas')
      
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.type || !formData.hours_saved) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      const url = editingId ? `/api/saved-hours/${editingId}` : '/api/saved-hours'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erro ao salvar registro')

      toast.success(editingId ? 'Registro atualizado com sucesso!' : 'Registro criado com sucesso!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'Automação',
        hours_saved: '',
      })
      setShowForm(false)
      setEditingId(null)
      
      // Refresh data
      fetchRecords()
      fetchStats()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar registro')
    }
  }

  const handleEdit = (record: SavedHour) => {
    setFormData({
      title: record.title,
      description: record.description || '',
      type: record.type,
      hours_saved: record.hours_saved.toString(),
    })
    setEditingId(record.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return

    try {
      const response = await fetch(`/api/saved-hours/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir registro')

      toast.success('Registro excluído com sucesso!')
      fetchRecords()
      fetchStats()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir registro')
    }
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Automação',
      hours_saved: '',
    })
    setShowForm(false)
    setEditingId(null)
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600">
              Esta página é exclusiva do departamento de Tecnologia.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Preparar dados para os gráficos
  const monthlyData = stats?.byMonth.map(item => ({
    name: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    horas: item.hours,
    registros: item.count,
  })) || []

  const typeData = stats ? Object.entries(stats.byType).map(([type, data]) => ({
    name: type,
    horas: data.hours,
    registros: data.count,
  })) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Horas Economizadas
              </h1>
              <p className="text-gray-600">
                Acompanhe o impacto das soluções desenvolvidas pela equipe de Tecnologia
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {showForm ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Registro
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8" />
              <div className="text-right">
                <p className="text-sm opacity-90">Total de Horas</p>
                <p className="text-3xl font-bold">{stats?.totalHours.toFixed(1) || 0}h</p>
              </div>
            </div>
            <p className="text-sm opacity-90">Tempo economizado</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8" />
              <div className="text-right">
                <p className="text-sm opacity-90">Projetos</p>
                <p className="text-3xl font-bold">{stats?.totalRecords || 0}</p>
              </div>
            </div>
            <p className="text-sm opacity-90">Registros cadastrados</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8" />
              <div className="text-right">
                <p className="text-sm opacity-90">Média por Projeto</p>
                <p className="text-3xl font-bold">
                  {stats?.totalRecords ? (stats.totalHours / stats.totalRecords).toFixed(1) : 0}h
                </p>
              </div>
            </div>
            <p className="text-sm opacity-90">Horas por registro</p>
          </Card>
        </div>

        {/* Formulário */}
        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingId ? 'Editar Registro' : 'Novo Registro'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Automação de relatórios"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="hours_saved">Horas Economizadas *</Label>
                  <Input
                    id="hours_saved"
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.hours_saved}
                    onChange={(e) => setFormData({ ...formData, hours_saved: e.target.value })}
                    placeholder="Ex: 10.5"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o que foi desenvolvido e qual o impacto..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Gráficos */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Evolução Mensal
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="horas" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Horas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Horas por Tipo
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="horas" fill="#10b981" name="Horas" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {/* Lista de registros */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Registros
          </h2>
          <div className="space-y-4">
            {records.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum registro encontrado</p>
                <p className="text-sm">Comece adicionando seu primeiro registro de horas economizadas</p>
              </div>
            ) : (
              records.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {record.title}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {record.type}
                        </span>
                      </div>
                      {record.description && (
                        <p className="text-gray-600 text-sm mb-2">
                          {record.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {record.hours_saved}h economizadas
                        </span>
                        <span>
                          {new Date(record.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleEdit(record)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(record.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

