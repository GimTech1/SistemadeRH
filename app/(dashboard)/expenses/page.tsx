'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Filter, Plus, Search } from 'lucide-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface DepartmentOption { id: string; name: string }

interface ExpenseRow {
  id: string
  title: string
  description: string | null
  amount: number
  date: string
  category: string | null
  department_id: string
  department?: { id: string; name: string }
  created_by: string
  created_at: string
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

  const isManagerOrAdmin = userRole === 'gerente' || userRole === 'admin'

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
        setCanViewAll(profile.role === 'admin' || SUPER_IDS.includes(user.id))
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

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isManagerOrAdmin) return
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      amount: Number(formData.get('amount') || 0),
      date: String(formData.get('date') || ''),
      category: String(formData.get('category') || ''),
    }
    if (!payload.title || !payload.amount || !payload.date) return
    setCreating(true)
    try {
      const resp = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (resp.ok) {
        form.reset()
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
      const key = exp.department_id
      const name = exp.department?.name || 'Setor'
      const current = map.get(key)
      const nextTotal = (current?.total || 0) + (exp.amount || 0)
      map.set(key, { name, total: nextTotal })
    }
    return Array.from(map.entries()).map(([id, v]) => ({ id, ...v }))
  }, [expenses])

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filtros</span>
        </div>
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
      </Card>

      {isManagerOrAdmin && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-4 h-4" />
            <span className="font-medium">Cadastrar gasto do meu setor</span>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-6 gap-3" onSubmit={handleCreate}>
            <div className="md:col-span-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="category2">Categoria</Label>
              <Input id="category2" name="category" />
            </div>
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" name="amount" type="number" step="0.01" required />
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
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
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium">Gastos</span>
          <div className="flex items-center gap-3">
            {canViewAll && (
              <div className="rounded-xl border px-4 py-2 bg-white/70 text-sm">
                <span className="text-slate-600 mr-2">Gasto total:</span>
                <span className="font-semibold">
                  {expenses.reduce((acc, e) => acc + (e.amount || 0), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            )}
            <Button variant="secondary"><Download className="w-4 h-4 mr-2" />Exportar CSV</Button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-sm text-gray-500">Carregando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Data</th>
                  <th className="p-2">Título</th>
                  <th className="p-2">Categoria</th>
                  <th className="p-2">Setor</th>
                  <th className="p-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id} className="border-b hover:bg-gray-50/30">
                    <td className="p-2">{new Date(e.date).toLocaleDateString('pt-BR')}</td>
                    <td className="p-2">{e.title}</td>
                    <td className="p-2">{e.category || '-'}</td>
                    <td className="p-2">{e.department?.name || '-'}</td>
                    <td className="p-2 text-right">{e.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-gray-500" colSpan={5}>Nenhum gasto encontrado</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <div className="font-medium mb-2">Totais por setor</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {totalByDepartment.map((d) => (
            <div key={d.id} className="rounded-md border p-3 bg-white/50">
              <div className="text-sm text-gray-600">{d.name}</div>
              <div className="text-lg font-semibold">{d.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
            </div>
          ))}
          {totalByDepartment.length === 0 && (
            <div className="text-sm text-gray-500">Sem valores no período/critério.</div>
          )}
        </div>
      </Card>
    </div>
  )
}


