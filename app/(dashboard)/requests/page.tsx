'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ChevronDown } from 'lucide-react'

type RequestStatus = 'requested' | 'approved' | 'rejected' | 'done'

type EmployeeOption = {
  id: string
  name: string
  departmentId?: string | null
}

type RequestItem = {
  id: string
  employeeId: string
  employeeName: string
  departmentId: string
  department: string
  description: string
  urgency: 'Pequena' | 'Média' | 'Grande' | 'Urgente'
  status: RequestStatus
  createdAt: string
}

export default function RequestsPage() {
  const supabase: SupabaseClient<Database> = createClient()
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [departments, setDepartments] = useState<EmployeeOption[]>([])
  const [loadingDepartments, setLoadingDepartments] = useState(true)

  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<'Pequena' | 'Média' | 'Grande' | 'Urgente' | ''>('')
  const [submitting, setSubmitting] = useState(false)

  const [activeTab, setActiveTab] = useState<RequestStatus>('requested')
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true)
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
          .order('name', { ascending: true })
        if (error) throw error
        const options: EmployeeOption[] = (data || []).map((d: any) => ({ id: d.id, name: d.name }))
        setDepartments(options)
      } catch (err) {
        toast.error('Não foi possível carregar departamentos')
      } finally {
        setLoadingDepartments(false)
      }
    }
    loadDepartments()
  }, [supabase])

  // Carregar colaboradores quando o setor for selecionado
  useEffect(() => {
    const loadEmployeesByDepartment = async () => {
      if (!departmentId) {
        setEmployees([])
        return
      }
      try {
        setLoadingEmployees(true)
        const { data, error } = await supabase
          .from('employees')
          .select('id, full_name, department')
          .eq('department', departmentId)
          .order('full_name', { ascending: true })
        if (error) throw error
        const options: EmployeeOption[] = (data || []).map((e: any) => ({
          id: e.id,
          name: e.full_name || 'Sem nome',
          departmentId: e.department ?? null,
        }))
        setEmployees(options)
      } catch (err) {
        toast.error('Não foi possível carregar colaboradores')
      } finally {
        setLoadingEmployees(false)
      }
    }

    // ao trocar de setor, limpa seleção de colaborador
    setSelectedEmployee('')
    loadEmployeesByDepartment()
  }, [departmentId, supabase])

  const filteredByTab = useMemo(() => {
    return requests.filter(r => r.status === activeTab)
  }, [requests, activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee || !description || !urgency || !departmentId) {
      toast.error('Preencha colaborador, setor, descrição e urgência')
      return
    }

    try {
      setSubmitting(true)
      const employee = employees.find(e => e.id === selectedEmployee)
      const dept = departments.find(d => d.id === departmentId)
      const insert = await (supabase as any)
        .from('requests')
        .insert({
          employee_id: selectedEmployee,
          department_id: departmentId,
          description: description.trim(),
          urgency,
          status: 'requested',
        } as any)
        .select('id, created_at')
        .single()

      if (insert.error) {
        console.error('Erro insert requests:', insert.error)
        toast.error('Erro ao salvar no banco: ' + insert.error.message)
        throw insert.error
      }

      const item: RequestItem = {
        id: (insert.data as any).id,
        employeeId: selectedEmployee,
        employeeName: employee?.name || 'Colaborador',
        departmentId,
        department: dept?.name || '—',
        description: description.trim(),
        urgency: urgency as any,
        status: 'requested',
        createdAt: (insert.data as any).created_at,
      }

      setRequests(prev => [item, ...prev])
      setSelectedEmployee('')
      setDepartmentId('')
      setDescription('')
      setUrgency('')
      toast.success('Solicitação criada')
      setActiveTab('requested')
    } catch (err) {
      toast.error('Erro ao criar solicitação')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = (id: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  // Carregar solicitações do banco
  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoadingRequests(true)
        const { data, error } = await (supabase as any)
          .from('requests')
          .select(`
            id,
            description,
            urgency,
            status,
            created_at,
            employee_id,
            department_id,
            employees:employee_id ( full_name ),
            departments:department_id ( name )
          `)
          .order('created_at', { ascending: false })
        if (error) throw error

        const mapped: RequestItem[] = (data || []).map((r: any) => ({
          id: r.id,
          employeeId: r.employee_id,
          employeeName: r.employees?.full_name || employees.find(e => e.id === r.employee_id)?.name || 'Colaborador',
          departmentId: r.department_id,
          department: r.departments?.name || departments.find(d => d.id === r.department_id)?.name || '—',
          description: r.description,
          urgency: r.urgency,
          status: r.status,
          createdAt: r.created_at,
        }))
        setRequests(mapped)
      } catch (err) {
        console.error('Erro load requests:', err)
        toast.error('Não foi possível carregar solicitações')
      } finally {
        setLoadingRequests(false)
      }
    }

    // só carrega quando já temos deps básicos
    if (departments.length > 0) {
      loadRequests()
    }
  }, [supabase, departments, employees])

  const handleUpdateStatus = async (id: string, status: RequestStatus) => {
    try {
      const current = requests.find(r => r.id === id)
      if (current?.status === 'done') {
        toast.error('Não é possível alterar o status de um pedido concluído.')
        return
      }
      const { error } = await (supabase as any)
        .from('requests')
        .update({ status } as any)
        .eq('id', id)
      if (error) throw error
      updateStatus(id, status)
    } catch (err) {
      toast.error('Falha ao atualizar status')
    }
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-roboto text-rich-black-900" style={{ fontWeight: 500 }}>Crie e acompanhe pedidos de equipamentos e recursos</h1>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-xl mb-4 text-rich-black-900" style={{ fontWeight: 500 }}>Formulário de Pedido</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="department">Setor</Label>
            <div className="relative mt-2">
              <select
                id="department"
                className={cn('w-full appearance-none rounded-md border border-platinum-300 bg-white px-3 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-yinmn-blue-500 no-native-arrow')}
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                disabled={loadingDepartments}
              >
                <option value="">Favor selecionar</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>{dep.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-600" />
            </div>
          </div>

          <div>
            <Label htmlFor="employee">Colaborador</Label>
            <div className="relative mt-2">
              <select
                id="employee"
                className={cn(
                  'w-full appearance-none rounded-md border border-platinum-300 bg-white px-3 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-yinmn-blue-500 no-native-arrow',
                )}
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                disabled={loadingEmployees || !departmentId}
              >
                <option value="">Favor selecionar</option>
              {employees.map(emp => {
                const depLabel = emp.departmentId ? departments.find(d => d.id === emp.departmentId)?.name : undefined
                return (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}{depLabel ? ` — ${depLabel}` : ''}
                  </option>
                )
              })}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-600" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Qual seria o pedido e o motivo?</Label>
            <Input id="description" placeholder="Ex.: Notebook para novo colaborador" value={description} onChange={e => setDescription(e.target.value)} className="mt-2" />
          </div>

          <div>
            <Label htmlFor="urgency">Urgência</Label>
            <div className="relative mt-2">
              <select
                id="urgency"
                className={cn('w-full appearance-none rounded-md border border-platinum-300 bg-white px-3 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-yinmn-blue-500 no-native-arrow')}
                value={urgency}
                onChange={e => setUrgency(e.target.value as any)}
              >
                <option value="">Favor selecionar</option>
                <option value="Pequena">Pequena</option>
                <option value="Média">Média</option>
                <option value="Grande">Grande</option>
                <option value="Urgente">Urgente</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-oxford-blue-600" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={submitting} className="text-white hover:brightness-110" style={{ backgroundColor: '#1B263B' }}>
              {submitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: 'requested', label: 'Solicitado' },
          { key: 'approved', label: 'Aprovado' },
          { key: 'rejected', label: 'Não Aprovado' },
          { key: 'done', label: 'Concluído' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as RequestStatus)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm border',
              activeTab === t.key ? 'bg-yinmn-blue-600 text-white border-yinmn-blue-600' : 'bg-white text-rich-black-900 border-platinum-300 hover:bg-platinum-100'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredByTab.length === 0 && (
          <Card className="p-6 text-sm text-oxford-blue-700">Nenhuma solicitação nesta etapa.</Card>
        )}
        {filteredByTab.map(item => (
          <Card key={item.id} className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-rich-black-900 font-medium">{item.employeeName} • {item.department || 'Sem setor'}</p>
              <p className="text-sm text-oxford-blue-700">{item.description}</p>
              <p className="text-xs text-oxford-blue-600">Urgência: {item.urgency} • {new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              {item.status === 'done' ? (
                <span className="text-xs px-3 py-1 rounded-xl bg-platinum-100 text-oxford-blue-700">
                  Este pedido está concluído e não pode ter o status alterado.
                </span>
              ) : (
                <>
                  {activeTab !== 'approved' && (
                    <Button variant="secondary" onClick={() => handleUpdateStatus(item.id, 'approved')}>Aprovar</Button>
                  )}
                  {activeTab !== 'rejected' && (
                    <Button variant="secondary" onClick={() => handleUpdateStatus(item.id, 'rejected')}>Não Aprovar</Button>
                  )}
                  {activeTab !== 'done' && (
                    <Button variant="secondary" onClick={() => handleUpdateStatus(item.id, 'done')}>Concluir</Button>
                  )}
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}


