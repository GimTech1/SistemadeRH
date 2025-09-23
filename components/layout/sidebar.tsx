'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Target,
  ClipboardCheck,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Building,
  MessageSquare,
  Bell,
  ChevronDown,
  UserCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface SidebarProps {
  userRole?: 'admin' | 'manager' | 'employee'
}

export function Sidebar({ userRole = 'employee' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const supabase: SupabaseClient<Database> = createClient()
  const [userName, setUserName] = useState<string>('Usuário')
  const [userPosition, setUserPosition] = useState<string>('')

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Colaboradores',
      icon: Users,
      href: '/employees',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Departamentos',
      icon: Building,
      href: '/departments',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Avaliações',
      icon: ClipboardCheck,
      href: '/evaluations',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Metas',
      icon: Target,
      href: '/goals',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Habilidades CHA',
      icon: Award,
      href: '/skills',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Feedbacks',
      icon: MessageSquare,
      href: '/feedback',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Avaliar Colegas',
      icon: Users,
      href: '/feedback/internal',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      href: '/reports',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Configurações',
      icon: Settings,
      href: '/settings',
      roles: ['admin'],
    },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  )

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Logout realizado com sucesso')
      router.push('/login')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fallback imediato a partir do Auth metadata
        const metaName = (user.user_metadata as any)?.full_name as string | undefined
        const metaPosition = (user.user_metadata as any)?.position as string | undefined
        if (metaName) setUserName(metaName)
        else if (user.email) setUserName(user.email)
        if (metaPosition) setUserPosition(metaPosition)

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, position')
          .eq('id', user.id)
          .single<{ full_name: string; position: string | null }>()

        if (profile) {
          setUserName(profile.full_name || 'Usuário')
          setUserPosition(profile.position || '')
        }
      } catch (error) {
        // silencioso
      }
    }

    loadProfile()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadProfile()
    })
    return () => {
      listener.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-900/90 backdrop-blur-md border border-dark-800"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-dark-900/95 backdrop-blur-md border-r border-dark-800 z-40",
          "transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-dark-800">
            <img 
              src="/logo-full-horizontal-branco.png" 
              alt="Logo da Empresa" 
              className="h-24 w-auto object-contain mx-auto"
              style={{ maxWidth: '95%' }}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                        "hover:bg-dark-800/50",
                        isActive && "bg-primary-600/20 text-primary-400 border-l-4 border-primary-500"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-dark-800 p-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-dark-800/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary-600/20 flex items-center justify-center">
                  <UserCircle className="h-6 w-6 text-primary-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-200 truncate" title={userName}>{userName}</p>
                  <p className="text-xs text-gray-500 truncate" title={userPosition || userRole}>
                    {userPosition || userRole}
                  </p>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isProfileOpen && "rotate-180"
                )} />
              </button>

              {isProfileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span className="text-sm">Meu Perfil</span>
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-dark-700 transition-colors"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="text-sm">Notificações</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-dark-700 transition-colors text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
