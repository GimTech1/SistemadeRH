'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { OneOnOneModal } from '@/components/one-on-one/OneOnOneModal'

interface OneOnOneMeeting {
  id: string
  manager_id: string
  employee_id: string
  meeting_date: string
  participants: string[]
  description: string | null
  agreements: string | null
  expected_date: string | null
  manager_approved: boolean
  employee_approved: boolean
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  manager: {
    full_name: string
    position: string
  }
  employee: {
    full_name: string
    position: string
  }
}

export default function OneOnOnePage() {
  const [meetings, setMeetings] = useState<OneOnOneMeeting[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<OneOnOneMeeting | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    loadMeetings()
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile && (profile as any).role) {
          setUserRole((profile as any).role)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar informações do usuário:', error)
    }
  }

  const loadMeetings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/one-on-one')
      const result = await response.json()
      
      if (response.ok) {
        setMeetings(result.data || [])
      } else {
        toast.error(result.error || 'Erro ao carregar reuniões')
      }
    } catch (error) {
      console.error('Erro ao carregar reuniões:', error)
      toast.error('Erro ao carregar reuniões')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (meetingId: string, type: 'manager' | 'employee') => {
    try {
      const response = await fetch(`/api/one-on-one/${meetingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type === 'manager' ? 'manager_approved' : 'employee_approved']: true,
        }),
      })

      if (response.ok) {
        toast.success('Aprovação registrada com sucesso!')
        loadMeetings()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Erro ao aprovar reunião')
      }
    } catch (error) {
      console.error('Erro ao aprovar reunião:', error)
      toast.error('Erro ao aprovar reunião')
    }
  }

  const handleDelete = async (meetingId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta reunião?')) return

    try {
      const response = await fetch(`/api/one-on-one/${meetingId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Reunião deletada com sucesso!')
        loadMeetings()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Erro ao deletar reunião')
      }
    } catch (error) {
      console.error('Erro ao deletar reunião:', error)
      toast.error('Erro ao deletar reunião')
    }
  }

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = 
      meeting.manager.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.agreements?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada'
      case 'completed': return 'Concluída'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerencie reuniões individuais entre gestores e funcionários</h1>
        </div>
        {(userRole === 'admin' || userRole === 'gerente') && (
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2" style={{ backgroundColor: '#1b263b' }}>
            <Plus className="w-4 h-4" />
            Nova Reunião
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search"
                placeholder="Buscar por gestor, funcionário, descrição ou acordos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">Todos</option>
              <option value="scheduled">Agendadas</option>
              <option value="completed">Concluídas</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Reuniões */}
      <div className="grid gap-4">
        {filteredMeetings.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reunião encontrada</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando uma nova reunião one-on-one'
              }
            </p>
          </Card>
        ) : (
          filteredMeetings.map((meeting) => (
            <Card key={meeting.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(meeting.status)}`}>
                      {getStatusText(meeting.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(meeting.meeting_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {meeting.manager.full_name} ↔ {meeting.employee.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {meeting.manager.position} ↔ {meeting.employee.position}
                  </p>
                  {meeting.description && (
                    <p className="text-gray-700 mb-2">{meeting.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMeeting(meeting)
                      setShowDetailsModal(true)
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {(userRole === 'admin' || meeting.manager_id === userId || meeting.employee_id === userId) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(meeting.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Aprovações */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Gestor:</span>
                  {meeting.manager_approved ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {meeting.manager_approved ? 'Aprovado' : 'Pendente'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Funcionário:</span>
                  {meeting.employee_approved ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">
                    {meeting.employee_approved ? 'Aprovado' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Botões de Aprovação */}
              {!meeting.manager_approved && (meeting.manager_id === userId || userRole === 'admin') && (
                <Button
                  onClick={() => handleApprove(meeting.id, 'manager')}
                  className="mr-2"
                  size="sm"
                >
                  Aprovar como Gestor
                </Button>
              )}
              {!meeting.employee_approved && (meeting.employee_id === userId || userRole === 'admin') && (
                <Button
                  onClick={() => handleApprove(meeting.id, 'employee')}
                  variant="outline"
                  size="sm"
                >
                  Aprovar como Funcionário
                </Button>
              )}

              {/* Acordos */}
              {meeting.agreements && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Acordos:</h4>
                  <p className="text-gray-700">{meeting.agreements}</p>
                </div>
              )}

              {/* Data Prevista */}
              {meeting.expected_date && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Data prevista: {format(new Date(meeting.expected_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetailsModal && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">Detalhes da Reunião</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Participantes</h3>
                <p className="text-gray-700">
                  <strong>Gestor:</strong> {selectedMeeting.manager.full_name} ({selectedMeeting.manager.position})
                </p>
                <p className="text-gray-700">
                  <strong>Funcionário:</strong> {selectedMeeting.employee.full_name} ({selectedMeeting.employee.position})
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Data da Reunião</h3>
                <p className="text-gray-700">
                  {format(new Date(selectedMeeting.meeting_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>

              {selectedMeeting.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                  <p className="text-gray-700">{selectedMeeting.description}</p>
                </div>
              )}

              {selectedMeeting.agreements && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Acordos</h3>
                  <p className="text-gray-700">{selectedMeeting.agreements}</p>
                </div>
              )}

              {selectedMeeting.expected_date && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Data Prevista</h3>
                  <p className="text-gray-700">
                    {format(new Date(selectedMeeting.expected_date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Status das Aprovações</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Gestor:</span>
                    {selectedMeeting.manager_approved ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {selectedMeeting.manager_approved ? 'Aprovado' : 'Pendente'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Funcionário:</span>
                    {selectedMeeting.employee_approved ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {selectedMeeting.employee_approved ? 'Aprovado' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <OneOnOneModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadMeetings}
      />
    </div>
  )
}
