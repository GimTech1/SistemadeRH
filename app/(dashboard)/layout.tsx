'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { Toaster } from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'employee'>('employee')
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const supabase: SupabaseClient<Database> = createClient()
  const [userName, setUserName] = useState('')
  const [userPosition, setUserPosition] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          router.push('/login')
          return
        }

        // Buscar o perfil do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, position')
          .eq('id', user.id)
          .single<{ role: Database['public']['Tables']['profiles']['Row']['role']; full_name: string | null; position: string | null }>()

        if (profile) {
          setUserRole(profile.role as 'admin' | 'manager' | 'employee')
          setUserName(profile.full_name || user.user_metadata?.full_name || user.email || 'Usuário')
          setUserPosition(profile.position || user.user_metadata?.position || '')
        } else {
          // Fallback somente com o auth
          setUserName(user.user_metadata?.full_name || user.email || 'Usuário')
          setUserPosition(user.user_metadata?.position || '')
        }
      } catch (error) {
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yinmn-blue-600"></div>
      </div>
    )
  }

  const getPageTitle = () => {
    const map: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/employees': 'Colaboradores',
      '/departments': 'Departamentos',
      '/evaluations': 'Avaliações',
      '/evaluations/new': 'Nova Avaliação',
      '/goals': 'Metas',
      '/feedback': 'Feedbacks',
      '/feedback/internal': 'Avaliar Colegas',
      '/feedback/external': 'Feedback Externo',
      '/reports': 'Relatórios',
    }
    // tenta match exato, senão usa segmento base
    if (map[pathname]) return map[pathname]
    const base = '/' + pathname.split('/').filter(Boolean)[0]
    return map[base] || 'Página'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Toaster position="top-right" />
      <Sidebar userRole={userRole} onCollapseChange={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <DashboardHeader
          title={getPageTitle()}
          onOpenMenu={() => {}}
          onNotificationClick={() => {}}
          hasUnread
          unreadCount={2}
          userName={userName}
          userPosition={userPosition}
        />

        <div className="min-h-screen pt-10">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}