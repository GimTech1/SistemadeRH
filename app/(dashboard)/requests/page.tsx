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
import { ChevronDown, X } from 'lucide-react'

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
  requestedToEmployeeId?: string | null
  requestedToEmployeeName?: string
  dueDate?: string | null
  title: string
  description: string
  urgency: 'Pequena' | 'Média' | 'Grande' | 'Urgente'
  status: RequestStatus
  createdAt: string
}

export default function RequestsPage() {
  const supabase: SupabaseClient<Database> = createClient()
  const [departments, setDepartments] = useState<EmployeeOption[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<'Pequena' | 'Média' | 'Grande' | 'Urgente' | ''>('')
  const [requestedToEmployeeId, setRequestedToEmployeeId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [activeTab, setActiveTab] = useState<RequestStatus | 'all'>('requested')
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  
  // Estados para modal de aprovação
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState('')
  
  // Estados para controle de permissões e informações do usuário
  const [userRole, setUserRole] = useState<'admin' | 'gerente' | 'employee'>('employee')
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmployeeName, setUserEmployeeName] = useState<string>('')

  // Carregar informações do usuário e verificar permissões
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) return

        setUserId(user.id)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, department_id, full_name')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) return

        const role = (profile as any).role?.toLowerCase() || 'employee'
        setUserRole(role === 'admin' || role === 'administrador' ? 'admin' : 
                   role === 'gerente' || role === 'manager' ? 'gerente' : 'employee')
        setUserDepartmentId((profile as any).department_id)
        
        // Buscar informações do employee para obter o nome completo
        const { data: employee } = await supabase
          .from('employees')
          .select('full_name')
          .eq('id', user.id)
          .single()

        if (employee) {
          setUserEmployeeName((employee as any).full_name || (profile as any).full_name || 'Colaborador')
        } else {
          setUserEmployeeName((profile as any).full_name || 'Colaborador')
        }
      } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error)
      }
    }

    loadUserInfo()
  }, [supabase])

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
          .order('name', { ascending: true })
        if (error) throw error
        const options: EmployeeOption[] = (data || []).map((d: any) => ({ id: d.id, name: d.name }))
        setDepartments(options)
      } catch (err) {
        // Não precisa mostrar erro, pois só é usado para exibição
      }
    }
    loadDepartments()
  }, [supabase])

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true)
        const { data, error } = await supabase
          .from('employees')
          .select('id, full_name, department')
          .eq('is_active', true)
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
    loadEmployees()
  }, [supabase])

  const filteredByTab = useMemo(() => {
    if (activeTab === 'all') return requests
    return requests.filter(r => r.status === activeTab)
  }, [requests, activeTab])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !userDepartmentId || !title || !description || !urgency || !requestedToEmployeeId) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setSubmitting(true)
      const dept = departments.find(d => d.id === userDepartmentId)
      const insert = await (supabase as any)
        .from('requests')
        .insert({
          employee_id: userId,
          department_id: userDepartmentId,
          requested_to_employee_id: requestedToEmployeeId,
          description: `${title.trim()} - ${description.trim()}`,
          urgency,
          status: 'requested',
        } as any)
        .select('id, created_at')
        .single()

      if (insert.error) {
        toast.error('Erro ao salvar no banco: ' + insert.error.message)
        throw insert.error
      }

      const requestedToEmployee = employees.find(e => e.id === requestedToEmployeeId)
      const item: RequestItem = {
        id: (insert.data as any).id,
        employeeId: userId,
        employeeName: userEmployeeName || 'Colaborador',
        departmentId: userDepartmentId,
        department: dept?.name || '—',
        requestedToEmployeeId: requestedToEmployeeId,
        requestedToEmployeeName: requestedToEmployee?.name || '—',
        title: title.trim(),
        description: description.trim(),
        urgency: urgency as any,
        status: 'requested',
        createdAt: (insert.data as any).created_at,
      }

      setRequests(prev => [item, ...prev])
      setTitle('')
      setDescription('')
      setUrgency('')
      setRequestedToEmployeeId('')
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

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoadingRequests(true)
        let query = (supabase as any)
          .from('requests')
          .select(`
            id,
            description,
            urgency,
            status,
            created_at,
            employee_id,
            department_id,
            due_date,
            requested_to_employee_id,
            employees:employee_id ( full_name ),
            departments:department_id ( name ),
            requested_to_employees:requested_to_employee_id ( full_name )
          `)
        
        // Admin vê todas as solicitações
        // Outros usuários veem as que enviaram OU receberam
        if (userRole !== 'admin' && userId) {
          query = query.or(`employee_id.eq.${userId},requested_to_employee_id.eq.${userId}` as any)
        }
        
        query = query.order('created_at', { ascending: false })
        const { data, error } = await query
        if (error) throw error

        const mapped: RequestItem[] = (data || []).map((r: any) => {
          // Extrair título e descrição da string combinada
          const fullDescription = r.description || ''
          const titleDescSplit = fullDescription.split(' - ')
          const title = titleDescSplit[0] || 'Sem título'
          const description = titleDescSplit.slice(1).join(' - ') || fullDescription
          
          // Buscar nome do employee destinatário
          let requestedToName = '—'
          if (r.requested_to_employee_id) {
            if (r.requested_to_employees?.full_name) {
              requestedToName = r.requested_to_employees.full_name
            } else {
              // Fallback: buscar na lista de employees já carregada
              const foundEmployee = employees.find(e => e.id === r.requested_to_employee_id)
              requestedToName = foundEmployee?.name || '—'
            }
          }
          
          return {
            id: r.id,
            employeeId: r.employee_id,
            employeeName: r.employees?.full_name || 'Colaborador',
            departmentId: r.department_id,
            department: r.departments?.name || departments.find(d => d.id === r.department_id)?.name || '—',
            requestedToEmployeeId: r.requested_to_employee_id,
            requestedToEmployeeName: requestedToName,
            dueDate: r.due_date || null,
            title,
            description,
            urgency: r.urgency,
            status: r.status,
            createdAt: r.created_at,
          }
        })
        setRequests(mapped)
      } catch (err) {
        toast.error('Não foi possível carregar solicitações')
      } finally {
        setLoadingRequests(false)
      }
    }

    if (departments.length > 0 && employees.length > 0 && (userId || userRole === 'admin')) {
      loadRequests()
    }
  }, [supabase, departments, employees, userId, userRole])

  // Função para verificar se o usuário pode aprovar requests
  const canApproveRequest = (request: RequestItem) => {
    // Admin pode aprovar qualquer request
    if (userRole === 'admin') return true
    
    // O destinatário da solicitação pode aprovar/rejeitar
    if (userId && request.requestedToEmployeeId === userId) return true
    
    return false
  }

  const handleUpdateStatus = async (id: string, status: RequestStatus, options?: { dueDate?: string | null }) => {
    try {
      const current = requests.find(r => r.id === id)
      if (current?.status === 'done') {
        toast.error('Não é possível alterar o status de um pedido concluído')
        return
      }
      
      // Verificar se o usuário tem permissão para alterar o status
      if (!canApproveRequest(current!)) {
        toast.error('Você não tem permissão para alterar o status desta solicitação')
        return
      }
      
      const updatePayload: any = { status }
      if (status === 'approved') {
        updatePayload.due_date = options?.dueDate ?? null
      }

      const { error } = await (supabase as any)
        .from('requests')
        .update(updatePayload)
        .eq('id', id)
      if (error) throw error
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status, dueDate: status === 'approved' ? (options?.dueDate ?? null) : r.dueDate } : r))
    } catch (err) {
      toast.error('Falha ao atualizar status')
    }
  }

  return (
    <div className="py-6 px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-roboto text-rich-black-900" style={{ fontWeight: 500 }}>Crie e acompanhe pedidos de equipamentos e recursos</h1>
      </div>

      <Card className="p-4 sm:p-6 mb-8">
        <h2 className="text-lg sm:text-xl mb-4 text-rich-black-900" style={{ fontWeight: 500 }}>Formulário de Pedido</h2>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="title">Título do Pedido</Label>
            <Input id="title" placeholder="Ex.: Solicitação de Notebook" value={title} onChange={e => setTitle(e.target.value)} className="mt-2" />
          </div>

          <div>
            <Label htmlFor="description">Descrição e Motivo</Label>
            <Input id="description" placeholder="Ex.: Necessário para novo colaborador do setor de vendas" value={description} onChange={e => setDescription(e.target.value)} className="mt-2" />
          </div>

          <div>
            <Label htmlFor="requestedTo">Para quem</Label>
            <div className="relative mt-2">
              <select
                id="requestedTo"
                className={cn(
                  'w-full appearance-none rounded-md border border-platinum-300 bg-white px-3 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-yinmn-blue-500 no-native-arrow',
                )}
                value={requestedToEmployeeId}
                onChange={e => setRequestedToEmployeeId(e.target.value)}
                disabled={loadingEmployees}
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

      <div className="mb-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'requested', label: 'Solicitado' },
            { key: 'approved', label: 'Aprovado' },
            { key: 'rejected', label: 'Recusado' },
            { key: 'done', label: 'Concluído' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm border flex-shrink-0',
                activeTab === t.key ? 'bg-yinmn-blue-600 text-white border-yinmn-blue-600' : 'bg-white text-rich-black-900 border-platinum-300 hover:bg-platinum-100'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredByTab.length === 0 && (
          <Card className="p-6 text-sm text-oxford-blue-700">Nenhuma solicitação nesta etapa.</Card>
        )}
        {filteredByTab.map(item => (
          <Card key={item.id} className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1 flex-1">
                <p className="text-rich-black-900 font-medium">{item.employeeName} • {item.department || 'Sem setor'}</p>
                {item.requestedToEmployeeName && (
                  <p className="text-sm text-oxford-blue-600">Para: {item.requestedToEmployeeName}</p>
                )}
                <p className="text-sm font-medium text-rich-black-900">{item.title}</p>
                <p className="text-sm text-oxford-blue-700">{item.description}</p>
                {item.dueDate && (
                  <p className="text-xs text-oxford-blue-700">Prazo: {new Date(item.dueDate).toLocaleDateString()}</p>
                )}
                <p className="text-xs text-oxford-blue-600">Urgência: {item.urgency} • {new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {item.status === 'done' ? (
                  <span className="text-xs px-3 py-1 rounded-xl bg-platinum-100 text-oxford-blue-700">
                    Este pedido está concluído e não pode ter o status alterado.
                  </span>
                ) : (
                  <>
                    {/* Mostrar botões apenas para quem recebeu a solicitação ou admin */}
                    {canApproveRequest(item) && (
                      <>
                        {item.status !== 'approved' && activeTab !== 'approved' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setApprovingRequestId(item.id)
                              setDueDate('')
                              setShowApproveModal(true)
                            }}
                          >
                            Aprovar
                          </Button>
                        )}
                        {item.status !== 'rejected' && activeTab !== 'rejected' && (
                          <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(item.id, 'rejected')}>Recusar</Button>
                        )}
                        {item.status === 'approved' && (
                          <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(item.id, 'done')}>Concluir</Button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Espaçamento no final da página para mobile */}
      <div className="h-8 sm:h-12"></div>

      {/* Modal de Aprovação com Prazo */}
      {showApproveModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => {
            setShowApproveModal(false)
            setApprovingRequestId(null)
            setDueDate('')
          }}
        >
          <Card 
            className="w-full max-w-md p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-roboto text-rich-black-900" style={{ fontWeight: 500 }}>
                  Aprovar Solicitação
                </h3>
                <p className="text-sm text-oxford-blue-600 mt-1">
                  Defina o prazo para conclusão desta solicitação
                </p>
              </div>
              <button
                onClick={() => {
                  setShowApproveModal(false)
                  setApprovingRequestId(null)
                  setDueDate('')
                }}
                className="p-2 text-oxford-blue-400 hover:text-oxford-blue-600 hover:bg-platinum-100 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="dueDate" className="text-rich-black-900">
                  Prazo para conclusão
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-2"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-oxford-blue-600 mt-1">
                  Selecione a data limite para conclusão desta solicitação
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-platinum-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApproveModal(false)
                  setApprovingRequestId(null)
                  setDueDate('')
                }}
                className="min-h-[44px]"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!dueDate) {
                    toast.error('Por favor, selecione uma data de prazo')
                    return
                  }
                  
                  const selectedDate = new Date(dueDate + 'T00:00:00')
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  
                  if (selectedDate < today) {
                    toast.error('A data de prazo não pode ser no passado')
                    return
                  }
                  
                  const isoDate = selectedDate.toISOString().slice(0, 10)
                  handleUpdateStatus(approvingRequestId!, 'approved', { dueDate: isoDate })
                  setShowApproveModal(false)
                  setApprovingRequestId(null)
                  setDueDate('')
                }}
                className="text-white hover:brightness-110 min-h-[44px]"
                style={{ backgroundColor: '#1B263B' }}
              >
                Aprovar com Prazo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}


