'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const supabase: SupabaseClient<Database> = createClient()

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
          .select('role')
          .eq('id', user.id)
          .single<{ role: Database['public']['Tables']['profiles']['Row']['role'] }>()

        if (profile) {
          setUserRole(profile.role as 'admin' | 'manager' | 'employee')
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
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
      <div className="min-h-screen bg-[#0a1929] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1929]">
      <Toaster position="top-right" />
      <Sidebar userRole={userRole} />
      <main className="lg:ml-64">
        {/* Header com logo mobile */}
        <header className="lg:hidden bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 p-4">
          <img 
            src="/logo-full-horizontal-branco.png" 
            alt="Logo" 
            className="h-16 w-auto object-contain mx-auto"
            style={{ maxWidth: '250px' }}
          />
        </header>
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
