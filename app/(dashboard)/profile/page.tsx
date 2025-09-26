'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, ArrowLeft, Loader2, User, Mail, Phone, Calendar, Building, Briefcase } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  department_id: string | null
  position: string | null
  admission_date: string | null
  phone: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([])
  const supabase = createClient()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    position: '',
    department_id: '',
    phone: '',
    admission_date: '',
  })

  useEffect(() => {
    loadProfile()
    loadDepartments()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setForm({
        full_name: data.full_name || '',
        email: data.email || '',
        position: data.position || '',
        department_id: data.department_id || '',
        phone: data.phone || '',
        admission_date: data.admission_date || '',
      })
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      toast.error('Erro ao carregar perfil')
    } finally {
      setLoading(false)
    }
  }

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name', { ascending: true })

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error)
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          position: form.position.trim() || null,
          department_id: form.department_id || null,
          phone: form.phone.trim() || null,
          admission_date: form.admission_date || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      toast.success('Perfil atualizado com sucesso!')
      await loadProfile() // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast.error('Erro ao salvar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-oxford-blue-600 font-roboto font-light">Carregando perfil...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-oxford-blue-600 hover:text-yinmn-blue-700">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
        <button
          disabled={saving}
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
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 text-white flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-roboto font-medium text-rich-black-900">Informações Pessoais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">Nome Completo</label>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">Telefone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">Data de Admissão</label>
                <input
                  type="date"
                  value={form.admission_date}
                  onChange={(e) => setForm(prev => ({ ...prev, admission_date: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-platinum-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 text-white flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-roboto font-medium text-rich-black-900">Informações Profissionais</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">Cargo</label>
                <input
                  value={form.position}
                  onChange={(e) => setForm(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                  placeholder="Seu cargo na empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-roboto font-medium text-rich-black-900 mb-1">Departamento</label>
                <select
                  value={form.department_id}
                  onChange={(e) => setForm(prev => ({ ...prev, department_id: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-platinum-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                >
                  <option value="">Selecione um departamento</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-platinum-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 text-white flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-roboto font-medium text-rich-black-900">Informações da Conta</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-oxford-blue-500 font-roboto font-medium">Função</p>
                <p className="text-sm text-rich-black-900 font-roboto">{profile?.role || 'Não definido'}</p>
              </div>
              <div>
                <p className="text-sm text-oxford-blue-500 font-roboto font-medium">ID do Usuário</p>
                <p className="text-sm text-rich-black-900 font-roboto font-mono">{profile?.id || 'Não disponível'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
