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
  FilePlus2,
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
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
interface SidebarProps {
  userRole?: 'admin' | 'manager' | 'employee'
  onCollapseChange?: (isCollapsed: boolean) => void
  mobileOpen?: boolean
  onMobileOpenChange?: (open: boolean) => void
}

export function Sidebar({ userRole = 'employee', onCollapseChange, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const supabase: SupabaseClient<Database> = createClient()
  const [userName, setUserName] = useState<string>('Usuário')
  const [userPosition, setUserPosition] = useState<string>('')

  const isOpen = mobileOpen ?? internalOpen
  const setIsOpen = onMobileOpenChange ?? setInternalOpen
  const shouldExpand = !isCollapsed || (isHovered && typeof window !== 'undefined' && window.innerWidth >= 1024)

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
      title: 'Metas',
      icon: Target,
      href: '/goals',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Solicitações',
      icon: FilePlus2,
      href: '/requests',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Avaliações',
      icon: ClipboardCheck,
      href: '/evaluations',
      roles: ['admin', 'manager', 'employee'],
    },
    {
      title: 'Ciclos de Avaliação',
      icon: Calendar,
      href: '/cycles',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Habilidades CHA',
      icon: Award,
      href: '/skills',
      roles: [''],
    },
    {
      title: 'Feedbacks',
      icon: MessageSquare,
      href: '/feedback',
      roles: [''],
    },
    {
      title: 'Avaliar Colegas',
      icon: Users,
      href: '/feedback/internal',
      roles: [''],
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      href: '/reports',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Usuários',
      icon: Users,
      href: '/users',
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
    setIsCollapsed(true)
    onCollapseChange?.(true)
  }, [onCollapseChange])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
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
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 flex-col z-40 shadow-lg transition-all duration-300 h-screen",
          "lg:flex",
          isOpen ? "flex" : "hidden",
          shouldExpand ? "w-64" : "w-[70px]"
        )}
        style={{ backgroundColor: '#0D1B2A' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          "border-b border-gray-600 flex items-center justify-between flex-shrink-0",
          shouldExpand ? "p-4" : "p-3"
        )}>
          {shouldExpand && (
            <div className="flex items-center">
              <Image 
                src="/logo-full-horizontal-branco.png" 
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
              "p-2 rounded-xl text-white hover:text-white hover:bg-gray-700 transition-all duration-300",
              !shouldExpand ? "mx-auto" : ""
            )}
            title={isCollapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

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
                      shouldExpand ? "px-4 py-3" : "justify-center px-2 py-3",
                      isActive 
                        ? "bg-gray-700 text-white shadow-sm" 
                        : "text-white hover:bg-gray-700 hover:text-white"
                    )}
                    title={!shouldExpand ? item.title : undefined}
                  >
                    <Icon className={cn(
                      "flex-shrink-0",
                      shouldExpand ? "w-5 h-5 mr-3" : "w-5 h-5"
                    )} />
                    {shouldExpand && <span className="tracking-wide">{item.title}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>

          <div className="border-t border-gray-600 pt-2 mt-2">
            <div className="mb-2 space-y-1">
              <Link
                href="/profile"
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-roboto font-medium text-white hover:bg-gray-700 hover:text-white transition-all duration-300",
                  shouldExpand ? "px-4 py-3" : "justify-center px-2 py-3"
                )}
                title={!shouldExpand ? "Meu Perfil" : undefined}
              >
                <UserCircle className={cn(
                  "flex-shrink-0",
                  shouldExpand ? "w-5 h-5 mr-3" : "w-5 h-5"
                )} />
                {shouldExpand && <span className="tracking-wide">Meu Perfil</span>}
              </Link>

              <Link
                href="/"
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-roboto font-medium text-white hover:bg-gray-700 hover:text-white transition-all duration-300",
                  shouldExpand ? "px-4 py-3" : "justify-center px-2 py-3"
                )}
                title={!shouldExpand ? "Início" : undefined}
              >
                <Home className={cn(
                  "flex-shrink-0",
                  shouldExpand ? "w-5 h-5 mr-3" : "w-5 h-5"
                )} />
                {shouldExpand && <span className="tracking-wide">Início</span>}
              </Link>

              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-roboto font-medium text-white hover:bg-red-600 hover:text-white transition-all duration-300",
                  shouldExpand ? "px-4 py-3" : "justify-center px-2 py-3"
                )}
                title={!shouldExpand ? "Sair" : undefined}
              >
                <LogOut className={cn(
                  "flex-shrink-0",
                  shouldExpand ? "w-5 h-5 mr-3" : "w-5 h-5"
                )} />
                {shouldExpand && <span className="tracking-wide">Sair</span>}
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}