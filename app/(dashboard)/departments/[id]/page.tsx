'use client'

import { useEffect, useMemo, useState, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Save, ArrowLeft, Loader2, Building, Users } from 'lucide-react'
import toast from 'react-hot-toast'

type Department = {
  id: string
  name: string
  description: string | null
  manager_id: string | null
  parent_department_id: string | null
  created_at?: string
  updated_at?: string
}

export default function DepartmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const supabase = createClient()

  const resolvedParams = use(params)
  const departmentId = useMemo(() => resolvedParams.id, [resolvedParams.id])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [department, setDepartment] = useState<Department | null>(null)

  const [form, setForm] = useState({
    name: '',
    description: '' as string | null,
    manager_id: '' as string | null,
    parent_department_id: '' as string | null,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/departments/${departmentId}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Erro ao carregar departamento')

        const dep: Department = json.department
        setDepartment(dep)
        setForm({
          name: dep.name,
          description: dep.description,
          manager_id: dep.manager_id,
          parent_department_id: dep.parent_department_id,
        })
      } catch (e: any) {
        toast.error(e.message || 'Erro ao carregar')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [departmentId])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim?.() || null,
        manager_id: form.manager_id || null,
        parent_department_id: form.parent_department_id || null,
      }

      const res = await fetch(`/api/departments/${departmentId}` ,{
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Erro ao salvar')

      toast.success('Departamento atualizado')
      setDepartment(json.department)
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/departments" className="inline-flex items-center gap-2 text-oxford-blue-600 hover:text-yinmn-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
        <button
          disabled={saving || loading}
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-yinmn-blue-600 text-white px-5 py-2.5 rounded-xl disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-platinum-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 text-white flex items-center justify-center">
                <Building className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-roboto font-medium text-rich-black-900">Informações do Departamento</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">Nome</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                  placeholder="Ex: Tecnologia"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">Departamento Pai</label>
                <input
                  value={form.parent_department_id || ''}
                  onChange={(e) => setForm((f) => ({ ...f, parent_department_id: e.target.value || null }))}
                  className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                  placeholder="ID do departamento pai (opcional)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">Descrição</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500 resize-none"
                  placeholder="Descreva o departamento..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-platinum-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 text-white flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-roboto font-medium text-rich-black-900">Gerência</h2>
            </div>
            <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">ID do Gerente</label>
            <input
              value={form.manager_id || ''}
              onChange={(e) => setForm((f) => ({ ...f, manager_id: e.target.value || null }))}
              className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
              placeholder="ID do gerente (opcional)"
            />
            <p className="text-xs text-oxford-blue-500 mt-2">
              Em breve substituiremos por um seletor de usuários com role "gerente".
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-platinum-200 p-6">
            <p className="text-sm text-oxford-blue-600">
              Criado em: {department?.created_at ? new Date(department.created_at).toLocaleString() : '-'}
            </p>
            <p className="text-sm text-oxford-blue-600">
              Atualizado em: {department?.updated_at ? new Date(department.updated_at).toLocaleString() : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


