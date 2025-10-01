'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

type Role = Database['public']['Tables']['profiles']['Row']['role']

interface ProfileRow {
  id: string
  email: string
  full_name: string
  role: Role
  position: string | null
  department_id: string | null
  is_active: boolean
  created_at: string
}

export default function UsersPage() {
  const supabase: SupabaseClient<Database> = createClient()
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const [role, setRole] = useState<Role>('employee')
  const [users, setUsers] = useState<ProfileRow[]>([])

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = '/login'
          return
        }
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single<{ role: Role }>()
        const currentRole = profile?.role ?? 'employee'
        setRole(currentRole)
        if (currentRole !== 'admin') {
          toast.error('Acesso restrito a administradores')
          window.location.href = '/dashboard'
          return
        }
      } catch (e) {
        window.location.href = '/login'
        return
      } finally {
        setChecking(false)
      }

      try {
        const res = await fetch('/api/users')
        if (!res.ok) {
          throw new Error('Falha ao carregar usuários')
        }
        const data = await res.json()
        setUsers(data.users as ProfileRow[])
      } catch (e) {
        toast.error('Erro ao carregar usuários')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [supabase])

  const updateRole = async (userId: string, newRole: Role) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Erro' }))
        throw new Error(data.error || 'Erro ao atualizar role')
      }
      // Revalida a lista no backend para refletir exatamente o que está no BD
      const refresh = await fetch('/api/users')
      if (refresh.ok) {
        const data = await refresh.json()
        setUsers(data.users as ProfileRow[])
      } else {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
      toast.success('Role atualizada')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao atualizar role')
    }
  }

  if (checking || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yinmn-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Cards - Mobile */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {users.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-platinum-200 p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-roboto font-medium text-rich-black-900 truncate">{u.full_name}</h3>
                    <p className="text-xs font-roboto font-light text-oxford-blue-600 mt-1 truncate">{u.email}</p>
                    <p className="text-xs font-roboto font-light text-oxford-blue-600 mt-1">{u.position || '-'}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-roboto font-medium text-rich-black-900 mb-1">Role</label>
                  <select
                    className="w-full border border-platinum-300 rounded-lg px-3 py-2 text-sm appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-yinmn-blue-500"
                    value={u.role}
                    onChange={(e) => updateRole(u.id, e.target.value as Role)}
                  >
                    <option value="employee">employee</option>
                    <option value="gerente">gerente</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela - Desktop/Tablet */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cargo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{u.full_name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{u.position || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <select
                        className="border rounded-md px-3 py-2 appearance-none bg-white pr-10 min-w-[140px]"
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value as Role)}
                      >
                        <option value="employee">employee</option>
                        <option value="gerente">gerente</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


