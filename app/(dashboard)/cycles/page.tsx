'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
interface Cycle {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
}

export default function CyclesPage() {
  const router = useRouter()
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCycle, setNewCycle] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
  })
  const supabase = createClient()
  useEffect(() => {
    loadCycles()
  }, [])

  const loadCycles = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('evaluation_cycles')
        .select('*')
        .order('start_date', { ascending: false })
      if (error) {
        toast.error('Erro ao carregar ciclos')
        return
      }

      setCycles(data || [])
    } catch (error) {
      toast.error('Erro ao carregar ciclos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCycle = async () => {
    if (!newCycle.name || !newCycle.start_date || !newCycle.end_date) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    if (new Date(newCycle.start_date) >= new Date(newCycle.end_date)) {
      toast.error('A data de início deve ser anterior à data de fim')
      return
    }
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('evaluation_cycles')
        .insert({
          name: newCycle.name,
          description: newCycle.description || null,
          start_date: newCycle.start_date,
          end_date: newCycle.end_date,
          is_active: true,
          created_by: user?.id,
        } as any)
      if (error) {
        if (error.message?.includes('permission denied') || error.message?.includes('403')) {
          toast.error('Você não tem permissão para criar ciclos. Apenas administradores e gerentes podem criar ciclos.')
        } else {
          toast.error(`Erro ao criar ciclo: ${error.message}`)
        }
        return
      }

      toast.success('Ciclo criado com sucesso!')
      setShowCreateForm(false)
      setNewCycle({ name: '', description: '', start_date: '', end_date: '' })
      loadCycles()
    } catch (error) {
      toast.error('Erro ao criar ciclo')
    } finally {
      setLoading(false)
    }
  }

  const toggleCycleStatus = async (cycleId: string, currentStatus: boolean) => {
    setLoading(true)
    try {
      const { error } = await (supabase as any)
        .from('evaluation_cycles')
        .update({ is_active: !currentStatus })
        .eq('id', cycleId)

      if (error) {
        toast.error('Erro ao atualizar status do ciclo')
        return
      }

      toast.success(`Ciclo ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`)
      loadCycles()
    } catch (error) {
      toast.error('Erro ao atualizar status do ciclo')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Ativo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inativo
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-roboto font-medium text-rich-black-900 tracking-wide">
            Ciclos de Avaliação
          </h1>
          <p className="text-sm font-roboto font-light text-oxford-blue-600 mt-1">
            Gerencie os ciclos de avaliação da empresa
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: '#1B263B' }}
        >
          <Plus className="h-4 w-4" />
          Novo Ciclo
        </button>
      </div>
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-roboto font-medium text-rich-black-900 mb-6">
              Criar Novo Ciclo
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Nome do Ciclo *
                </label>
                <input
                  type="text"
                  value={newCycle.name}
                  onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  placeholder="Ex: Avaliação 2024 Q1"
                />
              </div>
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                  Descrição
                </label>
                <textarea
                  value={newCycle.description}
                  onChange={(e) => setNewCycle({ ...newCycle, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Descrição do ciclo de avaliação..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={newCycle.start_date}
                    onChange={(e) => setNewCycle({ ...newCycle, start_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-2">
                    Data de Fim *
                  </label>
                  <input
                    type="date"
                    value={newCycle.end_date}
                    onChange={(e) => setNewCycle({ ...newCycle, end_date: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-lg text-rich-black-900 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-oxford-blue-600 hover:bg-platinum-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCycle}
                disabled={loading}
                className="text-white px-6 py-2 rounded-lg font-roboto font-medium transition-all duration-200 disabled:opacity-50"
                style={{ backgroundColor: '#1B263B' }}
              >
                {loading ? 'Criando...' : 'Criar Ciclo'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-platinum-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yinmn-blue-500 mx-auto"></div>
            <p className="text-sm text-oxford-blue-600 mt-2">Carregando ciclos...</p>
          </div>
        ) : cycles.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="h-12 w-12 text-platinum-400 mx-auto mb-4" />
            <h3 className="text-lg font-roboto font-medium text-rich-black-900 mb-2">
              Nenhum ciclo encontrado
            </h3>
            <p className="text-sm text-oxford-blue-600 mb-4">
              Crie seu primeiro ciclo de avaliação
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-white px-6 py-3 rounded-2xl font-roboto font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 hover:opacity-90 mx-auto"
              style={{ backgroundColor: '#1B263B' }}
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Ciclo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-platinum-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-roboto font-medium text-oxford-blue-600">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-roboto font-medium text-oxford-blue-600">
                    Período
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-roboto font-medium text-oxford-blue-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-roboto font-medium text-oxford-blue-600">
                    Criado em
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-roboto font-medium text-oxford-blue-600">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-platinum-200">
                {cycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-platinum-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-roboto font-medium text-rich-black-900">
                          {cycle.name}
                        </div>
                        {cycle.description && (
                          <div className="text-sm text-oxford-blue-600 mt-1">
                            {cycle.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-rich-black-900">
                        {formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(cycle.is_active)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-oxford-blue-600">
                        {formatDate(cycle.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => toggleCycleStatus(cycle.id, cycle.is_active)}
                          className="p-2 hover:bg-platinum-100 rounded-lg transition-colors"
                          title={cycle.is_active ? 'Desativar ciclo' : 'Ativar ciclo'}
                        >
                          {cycle.is_active ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
