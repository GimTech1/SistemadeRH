'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

interface SidebarProps {
  userRole?: 'admin' | 'manager' | 'employee'
  onCollapseChange?: (isCollapsed: boolean) => void
}

export function Sidebar({ userRole = 'employee', onCollapseChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
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

  const toggleSidebar = () => {
    const next = !isCollapsed
    setIsCollapsed(next)
    onCollapseChange?.(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(next))
    }
  }

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarCollapsed')
      if (savedState === 'true') {
        setIsCollapsed(true)
        onCollapseChange?.(true)
      }
    }
  }, [onCollapseChange])

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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg text-slate-700 hover:text-slate-900 hover:bg-white transition-all duration-300"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
          "fixed left-0 top-0 flex-col bg-platinum-50/95 backdrop-blur-md border-r border-platinum-200 z-40 shadow-lg transition-all duration-300 h-screen",
          "lg:flex",
          isOpen ? "flex" : "hidden",
          isCollapsed ? "w-[70px]" : "w-64"
        )}
      >
        {/* Header com logo */}
        <div className={cn(
          "border-b border-platinum-200 flex items-center justify-between flex-shrink-0",
          isCollapsed ? "p-3" : "p-4"
        )}>
          {!isCollapsed && (
            <div className="flex items-center">
              <Image 
                src="/logo-full-horizontal-preto.png" 
                alt="Logo" 
                width={500} 
                height={500} 
                className="mr-3"
              />
            </div>
          )}
          
          <button 
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-xl text-oxford-blue-600 hover:text-oxford-blue-800 hover:bg-platinum-100 transition-all duration-300",
              isCollapsed ? "mx-auto" : ""
            )}
            title={isCollapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Menu principal */}
        <nav className="flex-1 p-2 flex flex-col justify-between">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-xl text-sm font-roboto font-medium transition-all duration-300",
                      isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3",
                      isActive 
                        ? "bg-yinmn-blue-100 text-yinmn-blue-800 shadow-sm" 
                        : "text-oxford-blue-700 hover:bg-platinum-100 hover:text-oxford-blue-800"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn(
                      "flex-shrink-0",
                      isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
                    )} />
                    {!isCollapsed && <span className="tracking-wide">{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Footer - ações rápidas (sem bloco de perfil) */}
          <div className="border-t border-platinum-200 pt-2 mt-2">
            <div className="mb-2 space-y-1">
              <Link
                href="/"
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-roboto font-medium text-oxford-blue-700 hover:bg-platinum-100 hover:text-oxford-blue-800 transition-all duration-300",
                  isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
                )}
                title="Início"
              >
                <Home className={cn(
                  "flex-shrink-0",
                  isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
                )} />
                {!isCollapsed && <span className="tracking-wide">Início</span>}
              </Link>

              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-roboto font-medium text-oxford-blue-700 hover:bg-red-50 hover:text-red-700 transition-all duration-300",
                  isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3"
                )}
                title="Sair"
              >
                <LogOut className={cn(
                  "flex-shrink-0",
                  isCollapsed ? "w-5 h-5" : "w-5 h-5 mr-3"
                )} />
                {!isCollapsed && <span className="tracking-wide">Sair</span>}
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}