'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Filter, Plus, Search, Check, X, Send, User, ChevronUp, ChevronDown } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface DepartmentOption { id: string; name: string }

interface ExpenseRow {
  id: string
  title: string
  description: string | null
  amount: number
  quantity: number
  total: number
  date: string
  category: string | null
  department_id: string
  department?: { id: string; name: string }
  created_by: string
  created_at: string
  status: 'pending' | 'approved' | 'rejected'
}

export default function ExpensesPage() {
  const supabase: SupabaseClient<Database> = createClient()

  const [expenses, setExpenses] = useState<ExpenseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [userRole, setUserRole] = useState<'admin' | 'gerente' | 'employee'>('employee')
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null)

  // filtros
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')

  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [canViewAll, setCanViewAll] = useState(false)
  const [canApprove, setCanApprove] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'approve'>('list')
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [createOpen, setCreateOpen] = useState(true)
  const [quantity, setQuantity] = useState('')
  const [amount, setAmount] = useState('')

  const isManagerOrAdmin = userRole === 'gerente' || userRole === 'admin'
  
  // Converter strings para números para cálculo
  const quantityNum = parseFloat(quantity) || 0
  const amountNum = parseFloat(amount) || 0
  const total = quantityNum * amountNum

  const calculateTotal = () => {
    const totalInput = document.getElementById('total') as HTMLInputElement
    if (totalInput) {
      totalInput.value = total.toFixed(2)
    }
  }

  useEffect(() => {
    calculateTotal()
  }, [quantity, amount])

  useEffect(() => {
    loadBootstrap()
  }, [])

  const loadBootstrap = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, department_id')
        .eq('id', user.id)
        .single<{ role: 'admin' | 'gerente' | 'employee'; department_id: string | null }>()

      if (profile) {
        setUserRole(profile.role)
        setUserDepartmentId(profile.department_id)
        const SUPER_IDS = ['b8f68ba9-891c-4ca1-b765-43fee671928f', '02088194-3439-411d-bdfb-05a255d8be24']
        const APPROVERS = ['b8f68ba9-891c-4ca1-b765-43fee671928f', '02088194-3439-411d-bdfb-05a255d8be24']
        setCanViewAll(profile.role === 'admin' || SUPER_IDS.includes(user.id))
        setCanApprove(APPROVERS.includes(user.id))
      }

      const { data: deps } = await supabase
        .from('departments')
        .select('id, name')
        .order('name', { ascending: true })

      setDepartments((deps as any) || [])

      await loadExpenses()
    } catch (e) {
    }
  }

  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (departmentId) params.set('department_id', departmentId)
    if (startDate) params.set('start_date', startDate)
    if (endDate) params.set('end_date', endDate)
    if (minAmount) params.set('min_amount', minAmount)
    if (maxAmount) params.set('max_amount', maxAmount)
    if (statusFilter) params.set('status', statusFilter)
    return params.toString()
  }

  const loadExpenses = async () => {
    setLoading(true)
    try {
      const qs = buildQueryString()
      const url = qs ? `/api/expenses?${qs}` : '/api/expenses'
      const resp = await fetch(url)
      if (!resp.ok) {
        setExpenses([])
        return
      }
      const { expenses } = await resp.json()
      setExpenses(expenses || [])
    } catch (e) {
    } finally {
      setLoading(false)
    }
  }

  // Recarregar quando o filtro de status mudar na aba de aprovação
  useEffect(() => {
    if (activeTab === 'approve') {
      loadExpenses()
    }
  }, [statusFilter, activeTab])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isManagerOrAdmin) return
    
    // Validações
    if (!quantity.trim()) {
      alert('Por favor, insira a quantidade')
      return
    }
    
    if (quantityNum <= 0) {
      alert('A quantidade deve ser maior que 0')
      return
    }
    
    if (!amount.trim()) {
      alert('Por favor, insira o valor unitário')
      return
    }
    
    if (amountNum <= 0) {
      alert('O valor unitário deve ser maior que 0')
      return
    }
    
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      amount: amountNum,
      quantity: quantityNum,
      total: total,
      date: String(formData.get('date') || ''),
      category: String(formData.get('category') || ''),
    }
    if (!payload.title || !payload.date) return
    setCreating(true)
    try {
      const resp = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (resp.ok) {
        form.reset()
        setAmount('')
        setQuantity('')
        await loadExpenses()
      }
    } catch (e) {
    } finally {
      setCreating(false)
    }
  }

  const totalByDepartment = useMemo(() => {
    const map = new Map<string, { name: string; total: number }>()
    for (const exp of expenses) {
      if ((exp as any).status !== 'approved') continue
      const key = exp.department_id
      const name = exp.department?.name || 'Setor'
      const current = map.get(key)
      const nextTotal = (current?.total || 0) + (exp.total || exp.amount || 0)
      map.set(key, { name, total: nextTotal })
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }))
  }, [expenses])

  return (
    <div className="space-y-8 pb-8">
      {canViewAll && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Send className="w-4 h-4 inline mr-2" />
              Listagem
            </button>
            {canApprove && (
              <button
                onClick={() => setActiveTab('approve')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'approve'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Aprovação
              </button>
            )}
          </nav>
        </div>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtros</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setFiltersOpen(prev => !prev)}>
            {filtersOpen ? (
              <span className="flex items-center"><ChevronUp className="w-4 h-4 mr-1" /> Esconder</span>
            ) : (
              <span className="flex items-center"><ChevronDown className="w-4 h-4 mr-1" /> Mostrar</span>
            )}
          </Button>
        </div>
        {filtersOpen && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <Label htmlFor="q">Busca</Label>
            <div className="flex gap-2">
              <Input id="q" placeholder="Título ou descrição" value={q} onChange={(e) => setQ(e.target.value)} />
              <Button onClick={loadExpenses} variant="secondary" size="sm" aria-label="Buscar">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="category">Categoria</Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex.: Viagem" />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="department">Setor</Label>
            <select
              id="department"
              className="w-full h-14 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 appearance-none focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-100/40 hover:bg-white hover:border-slate-400 transition-all duration-300"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Todos</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <Label htmlFor="start">De</Label>
            <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="end">Até</Label>
            <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="min">Valor mínimo</Label>
            <Input id="min" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="max">Valor máximo</Label>
            <Input id="max" type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
          </div>
        </div>
        )}
      </Card>

      {isManagerOrAdmin && activeTab === 'list' && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="font-medium">Cadastrar gasto do meu setor</span>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(prev => !prev)}>
              {createOpen ? (
                <span className="flex items-center"><ChevronUp className="w-4 h-4 mr-1" /> Esconder</span>
              ) : (
                <span className="flex items-center"><ChevronDown className="w-4 h-4 mr-1" /> Mostrar</span>
              )}
            </Button>
          </div>
          {createOpen && (
          <form className="grid grid-cols-1 md:grid-cols-6 gap-3" onSubmit={handleCreate}>
            <div className="md:col-span-2">
              <Label htmlFor="title">Título <span className="text-red-600">*</span></Label>
              <Input id="title" name="title" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="category2">Categoria <span className="text-red-600">*</span></Label>
              <select
                id="category2"
                name="category"
                required
                className="w-full h-14 rounded-2xl border border-slate-300 bg-white px-5 py-4 text-sm text-slate-900 appearance-none focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-100/40 hover:bg-white hover:border-slate-400 transition-all duration-300"
                style={{
                  backgroundImage: `url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em',
                  paddingRight: '2rem'
                }}
              >
                <option value="">Selecione uma categoria</option>
                <option value="Despesas Operacionais">Despesas Operacionais</option>
                <option value="Despesas com Pessoal">Despesas com Pessoal</option>
                <option value="Marketing e Vendas">Marketing e Vendas</option>
                <option value="Financeiro e Contábil">Financeiro e Contábil</option>
                <option value="Tecnologia e Infraestrutura">Tecnologia e Infraestrutura</option>
                <option value="Diversos / Não Recorrentes">Diversos / Não Recorrentes</option>
                <option value="Investimentos e Expansão">Investimentos e Expansão</option>
              </select>
            </div>
            <div>
              <Label htmlFor="amount">Valor unitário <span className="text-red-600">*</span></Label>
              <Input 
                id="amount" 
                name="amount" 
                type="number" 
                step="0.01" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={amount && amountNum <= 0 ? 'border-red-500' : ''}
                required 
              />
              {amount && amountNum <= 0 && (
                <p className="text-red-500 text-xs mt-1">Valor deve ser maior que 0</p>
              )}
            </div>
            <div>
              <Label htmlFor="quantity">Quantidade <span className="text-red-600">*</span></Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number" 
                min="1" 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className={quantity && quantityNum <= 0 ? 'border-red-500' : ''}
                required 
              />
              {quantity && quantityNum <= 0 && (
                <p className="text-red-500 text-xs mt-1">Quantidade deve ser maior que 0</p>
              )}
            </div>
            <div>
              <Label htmlFor="total">Total</Label>
              <Input 
                id="total" 
                name="total" 
                type="number" 
                step="0.01" 
                value={total > 0 ? total.toFixed(2) : ''}
                readOnly 
                className="bg-gray-100" 
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="date">Data <span className="text-red-600">*</span></Label>
              <Input id="date" name="date" type="date" required />
            </div>
            <div className="md:col-span-6">
              <Label htmlFor="description">Descrição</Label>
              <Input id="description" name="description" />
            </div>
            <div className="md:col-span-6">
              <Button type="submit" disabled={creating} style={{ backgroundColor: '#1b263b' }}>{creating ? 'Salvando...' : 'Salvar gasto'}</Button>
            </div>
          </form>
          )}
        </Card>
      )}

      {activeTab === 'list' && (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Gastos</span>

        </div>

        {loading ? (
          <div className="py-8 text-sm text-gray-500">Carregando...</div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Data</th>
                    <th className="p-2">Título</th>
                    <th className="p-2">Categoria</th>
                    <th className="p-2">Setor</th>
                    <th className="p-2">Qtd</th>
                    <th className="p-2 text-right">Valor Unit.</th>
                    <th className="p-2 text-right">Total</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b hover:bg-gray-50/30">
                      <td className="p-2">{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">{e.title}</td>
                      <td className="p-2">{e.category || '-'}</td>
                      <td className="p-2">{e.department?.name || '-'}</td>
                      <td className="p-2">{e.quantity || 1}</td>
                      <td className="p-2 text-right">{e.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-2 text-right">{e.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.status === 'approved' ? 'bg-green-100 text-green-700' : e.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {e.status === 'approved' ? 'Aprovado' : e.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td className="p-4 text-center text-gray-500" colSpan={8}>Nenhum gasto encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {expenses.map((e) => (
                <div key={e.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">{e.title}</h3>
                      <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                      e.status === 'approved' 
                        ? 'text-green-700 bg-green-50/80 border border-green-200/50' 
                        : e.status === 'rejected'
                        ? 'text-red-700 bg-red-50/80 border border-red-200/50'
                        : 'text-amber-700 bg-amber-50/80 border border-amber-200/50'
                    }`}>
                      {e.status === 'approved' ? 'Aprovado' : e.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Categoria:</span>
                      <span className="font-medium text-gray-900">{e.category || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Setor:</span>
                      <span className="font-medium text-gray-900">{e.department?.name || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Quantidade:</span>
                      <span className="font-medium text-gray-900">{e.quantity || 1}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Valor Unit.:</span>
                      <span className="font-medium text-gray-900">{e.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-blue-600">{e.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum gasto encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
      )}

      {canApprove && activeTab === 'approve' && (
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Aprovação de Gastos</span>
          <div className="flex items-center gap-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className="h-10 rounded-xl border px-3 appearance-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.25em 1.25em',
                paddingRight: '2rem'
              }}
            >
              <option value="">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl border p-4 bg-white/80">
            <div className="text-sm text-slate-600">Gasto total no período</div>
            <div className="text-2xl font-semibold">
              {expenses.filter(e => (e as any).status === 'approved').reduce((acc, e) => acc + (e.total || e.amount || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>

        <div>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Data</th>
                  <th className="p-2">Título</th>
                  <th className="p-2">Categoria</th>
                  <th className="p-2">Setor</th>
                  <th className="p-2">Qtd</th>
                  <th className="p-2 text-right">Valor Unit.</th>
                  <th className="p-2 text-right">Total</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50/30">
                    <td className="p-2">{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2">{e.title}</td>
                    <td className="p-2">{e.category || '-'}</td>
                    <td className="p-2">{e.department?.name || '-'}</td>
                    <td className="p-2">{e.quantity || 1}</td>
                    <td className="p-2 text-right">{e.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="p-2 text-right">{e.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${e.status === 'approved' ? 'bg-green-100 text-green-700' : e.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {e.status === 'approved' ? 'Aprovado' : e.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-2 text-right">
                      <div className="inline-flex gap-2">
                        {(e.status === 'pending' || e.status === 'rejected') && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={updatingId === e.id}
                            onClick={async () => {
                              setUpdatingId(e.id)
                              try {
                                await fetch(`/api/expenses/${e.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) })
                                await loadExpenses()
                              } finally { setUpdatingId(null) }
                            }}
                          >
                            <Check className="w-4 h-4 mr-1" /> Aprovar
                          </Button>
                        )}
                        {(e.status === 'pending' || e.status === 'approved') && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={updatingId === e.id}
                            onClick={async () => {
                              setUpdatingId(e.id)
                              try {
                                await fetch(`/api/expenses/${e.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) })
                                await loadExpenses()
                              } finally { setUpdatingId(null) }
                            }}
                          >
                            <X className="w-4 h-4 mr-1" /> Rejeitar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-gray-500" colSpan={9}>Nenhum gasto encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {expenses.map((e) => (
              <div key={e.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">{e.title}</h3>
                    <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                    e.status === 'approved' 
                      ? 'text-green-700 bg-green-50/80 border border-green-200/50' 
                      : e.status === 'rejected'
                      ? 'text-red-700 bg-red-50/80 border border-red-200/50'
                      : 'text-amber-700 bg-amber-50/80 border border-amber-200/50'
                  }`}>
                    {e.status === 'approved' ? 'Aprovado' : e.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Categoria:</span>
                    <span className="font-medium text-gray-900">{e.category || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Setor:</span>
                    <span className="font-medium text-gray-900">{e.department?.name || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Quantidade:</span>
                    <span className="font-medium text-gray-900">{e.quantity || 1}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Valor Unit.:</span>
                    <span className="font-medium text-gray-900">{e.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold border-t border-gray-200 pt-2">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-blue-600">{e.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>

                {/* Ações Mobile */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  {(e.status === 'pending' || e.status === 'rejected') && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={updatingId === e.id}
                      onClick={async () => {
                        setUpdatingId(e.id)
                        try {
                          await fetch(`/api/expenses/${e.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) })
                          await loadExpenses()
                        } finally { setUpdatingId(null) }
                      }}
                      className="flex-1"
                    >
                      <Check className="w-4 h-4 mr-1" /> Aprovar
                    </Button>
                  )}
                  {(e.status === 'pending' || e.status === 'approved') && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updatingId === e.id}
                      onClick={async () => {
                        setUpdatingId(e.id)
                        try {
                          await fetch(`/api/expenses/${e.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) })
                          await loadExpenses()
                        } finally { setUpdatingId(null) }
                      }}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-1" /> Rejeitar
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum gasto encontrado</p>
              </div>
            )}
          </div>
        </div>
      </Card>
      )}

      {canApprove && activeTab === 'approve' && (
        <Card className="p-4">
          <div className="font-medium mb-2">Totais por setor</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {departments.map((d) => {
                const total = expenses
                  .filter((e) => e.department_id === d.id && (e as any).status === 'approved')
                .reduce((sum, e) => sum + (e.total || e.amount || 0), 0)
              return (
                <div key={d.id} className="rounded-md border p-3 bg-white/50">
                  <div className="text-sm text-gray-600">{d.name}</div>
                  <div className="text-lg font-semibold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </div>
              )
            })}
            {departments.length === 0 && (
              <div className="text-sm text-gray-500">Nenhum setor cadastrado.</div>
            )}
          </div>
        </Card>
      )}

      {activeTab === 'list' && (
        <Card className="p-4">
          <div className="font-medium mb-2">Total do meu setor</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {userDepartmentId ? (
              (() => {
                const dept = departments.find(d => d.id === userDepartmentId)
                const total = expenses
                  .filter(e => e.department_id === userDepartmentId && (e as any).status === 'approved')
                  .reduce((sum, e) => sum + (e.total || e.amount || 0), 0)
                return (
                  <div key={userDepartmentId} className="rounded-md border p-3 bg-white/50">
                    <div className="text-sm text-gray-600">{dept?.name || 'Meu setor'}</div>
                    <div className="text-lg font-semibold">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </div>
                )
              })()
            ) : (
              <div className="text-sm text-gray-500">Sem setor associado ao usuário.</div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}


