'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Calendar, Users, FileText, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface OneOnOneModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  meeting?: any
  isEdit?: boolean
}

interface Profile {
  id: string
  full_name: string
  position: string
  role: string
}

export function OneOnOneModal({ isOpen, onClose, onSuccess, meeting, isEdit = false }: OneOnOneModalProps) {
  const [loading, setLoading] = useState(false)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [formData, setFormData] = useState({
    manager_id: '',
    employee_id: '',
    meeting_date: '',
    participants: [] as string[],
    description: '',
    agreements: '',
    expected_date: '',
  })
  const [participantInput, setParticipantInput] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadProfiles()
      if (isEdit && meeting) {
        setFormData({
          manager_id: meeting.manager_id || '',
          employee_id: meeting.employee_id || '',
          meeting_date: meeting.meeting_date ? format(new Date(meeting.meeting_date), "yyyy-MM-dd'T'HH:mm") : '',
          participants: meeting.participants || [],
          description: meeting.description || '',
          agreements: meeting.agreements || '',
          expected_date: meeting.expected_date ? format(new Date(meeting.expected_date), "yyyy-MM-dd'T'HH:mm") : '',
        })
      } else {
        setFormData({
          manager_id: '',
          employee_id: '',
          meeting_date: '',
          participants: [],
          description: '',
          agreements: '',
          expected_date: '',
        })
      }
    }
  }, [isOpen, isEdit, meeting])

  const loadProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, position, role')
        .order('full_name')

      if (error) {
        return
      }

      setProfiles(data || [])
    } catch (error) {
      // Erro ao carregar perfis
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit ? `/api/one-on-one/${meeting.id}` : '/api/one-on-one'
      const method = isEdit ? 'PUT' : 'POST'

      // Converter datas para formato ISO correto
      const dataToSend = {
        ...formData,
        meeting_date: formData.meeting_date ? new Date(formData.meeting_date).toISOString() : formData.meeting_date,
        expected_date: formData.expected_date ? new Date(formData.expected_date).toISOString() : formData.expected_date,
      }


      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        toast.success(isEdit ? 'Reunião atualizada com sucesso!' : 'Reunião criada com sucesso!')
        onSuccess()
        onClose()
      } else {
        const result = await response.json()
        toast.error(result.error || 'Erro ao salvar reunião')
      }
    } catch (error) {
      toast.error('Erro ao salvar reunião')
    } finally {
      setLoading(false)
    }
  }

  const addParticipant = () => {
    if (participantInput && !formData.participants.includes(participantInput)) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, participantInput]
      }))
      setParticipantInput('')
    }
  }

  const removeParticipant = (participantId: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p !== participantId)
    }))
  }

  const managers = profiles.filter(p => p.role === 'admin' || p.role === 'gerente')
  const employees = profiles.filter(p => p.role === 'employee')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Editar Reunião' : 'Nova Reunião One-on-One'}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gestor */}
          <div>
            <Label htmlFor="manager_id" className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              Gestor *
            </Label>
            <select
              id="manager_id"
              value={formData.manager_id}
              onChange={(e) => setFormData(prev => ({ ...prev, manager_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              required
            >
              <option value="">Selecione um gestor</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.full_name} - {manager.position}
                </option>
              ))}
            </select>
          </div>

          {/* Funcionário */}
          <div>
            <Label htmlFor="employee_id" className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              Funcionário *
            </Label>
            <select
              id="employee_id"
              value={formData.employee_id}
              onChange={(e) => setFormData(prev => ({ ...prev, employee_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              required
            >
              <option value="">Selecione um funcionário</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name} - {employee.position}
                </option>
              ))}
            </select>
          </div>

          {/* Data da Reunião */}
          <div>
            <Label htmlFor="meeting_date" className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Data da Reunião *
            </Label>
            <Input
              id="meeting_date"
              type="datetime-local"
              value={formData.meeting_date}
              onChange={(e) => setFormData(prev => ({ ...prev, meeting_date: e.target.value }))}
              required
            />
          </div>

          {/* Participantes Adicionais */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4" />
              Participantes Adicionais
            </Label>
            <div className="flex gap-2 mb-2">
              <select
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Selecione um funcionário</option>
                {employees
                  .filter(emp => emp.id !== formData.manager_id && emp.id !== formData.employee_id)
                  .map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name} - {employee.position}
                    </option>
                  ))}
              </select>
              <Button 
                type="button" 
                onClick={addParticipant} 
                variant="outline"
                disabled={!participantInput}
              >
                Adicionar
              </Button>
            </div>
            {formData.participants.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.participants.map((participantId, index) => {
                  const participant = profiles.find(p => p.id === participantId)
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                    >
                      {participant?.full_name || participantId}
                      <button
                        type="button"
                        onClick={() => removeParticipant(participantId)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              Descrição da Reunião
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descreva o objetivo e tópicos da reunião..."
            />
          </div>

          {/* Acordos */}
          <div>
            <Label htmlFor="agreements" className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" />
              Acordos e Compromissos
            </Label>
            <textarea
              id="agreements"
              value={formData.agreements}
              onChange={(e) => setFormData(prev => ({ ...prev, agreements: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descreva os acordos e compromissos estabelecidos na reunião..."
            />
          </div>

          {/* Data Prevista */}
          <div>
            <Label htmlFor="expected_date" className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              Data Prevista para Conclusão
            </Label>
            <Input
              id="expected_date"
              type="datetime-local"
              value={formData.expected_date}
              onChange={(e) => setFormData(prev => ({ ...prev, expected_date: e.target.value }))}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {isEdit ? 'Atualizar' : 'Criar'} Reunião
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
