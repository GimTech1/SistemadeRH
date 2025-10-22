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
  Paperclip,
  Notebook,
  Menu,
  X,
  Building,
  MessageSquare,
  Bell,
  ChevronDown,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  ChartLine,
  Home,
  Calendar,
  GitBranch,
  Receipt,
  Wallet,
  Star,
  BookMarked,
  Package,
  UserRoundPen,
  Workflow,
  DollarSign,
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const supabase: SupabaseClient<Database> = createClient()
  const [userName, setUserName] = useState<string>('Usuário')
  const [userPosition, setUserPosition] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)
  const allowedMeetingUserIds = [
    'd4f6ea0c-0ddc-41a4-a6d4-163fea1916c3',
    'c8ee5614-8730-477e-ba59-db4cd8b83ce8',
    '02088194-3439-411d-bdfb-05a255d8be24',
    '8370f649-8379-4f7b-b618-63bf4511b901',
    '5e6734c0-491a-4355-87cb-cce6f36c0350',
  ]

  const isOpen = mobileOpen ?? internalOpen
  const setIsOpen = onMobileOpenChange ?? setInternalOpen
  const shouldExpand = !isCollapsed || (isHovered && typeof window !== 'undefined' && window.innerWidth >= 1024)

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['admin', 'manager'],
    },
    {
      title: 'Gestão',
      icon: Notebook,
      isGroup: true,
      roles: ['admin', 'manager'],
      children: [
        {
          title: 'Colaboradores',
          icon: Users,
          href: '/employees',
          roles: ['admin', 'manager'],
        },
        {
          title: 'Departamentos',
          icon: Building,
          href: '/departments',
          roles: ['admin', 'manager'],
        },
        {
          title: 'Usuários',
          icon: UserRoundPen,
          href: '/users',
          roles: ['admin'],
        },
        {
          title: 'Organograma',
          icon: GitBranch,
          href: '/organograma',
          roles: ['admin', 'manager'],
        },
      ],
    },
    {
      title: 'Avaliações',
      icon: ClipboardCheck,
      isGroup: true,
      roles: ['admin', 'manager', 'employee'],
      children: [
        {
          title: 'Avaliações',
          icon: ChartLine,
          href: '/evaluations',
          roles: ['admin', 'manager'],
        },
        {
          title: 'Ciclos de Avaliação',
          icon: Calendar,
          href: '/cycles',
          roles: ['admin', 'manager'],
        },
        {
          title: 'Avaliar Colegas',
          icon: Star,
          href: '/feedback/internal',
          roles: ['admin', 'manager', 'employee'],
        },
        {
          title: 'Habilidades CHA',
          icon: Award,
          href: '/skills',
          roles: [''],
        },
        {
          title: 'PACE',
          icon: BookMarked,
          href: '/pace',
          roles: ['admin', 'manager', 'employee'],
        },
      ],
    },
    {
      title: 'Financeiro',
      icon: DollarSign,
      isGroup: true,
      roles: ['admin', 'manager', 'employee'],
      children: [
        {
          title: 'Notas Fiscais',
          icon: Receipt,
          href: '/invoices',
          roles: ['admin', 'manager', 'employee'],
        },
        {
          title: 'Gastos',
          icon: Wallet,
          href: '/expenses',
          roles: ['admin', 'manager'],
        },
      ],
    },
    {
      title: 'Operacional',
      icon: Package,
      isGroup: true,
      roles: ['admin', 'manager', 'employee'],
      children: [
        {
          title: 'Solicitações',
          icon: FilePlus2,
          href: '/requests',
          roles: ['admin', 'manager', 'employee'],
        },
        {
          title: 'Entregas',
          icon: Paperclip,
          href: '/deliveries',
          roles: ['admin', 'manager', 'employee'],
        },
        {
          title: 'Processos',
          icon: Workflow,
          href: '/processes',
          roles: ['admin', 'manager', 'employee'],
        },
        {
          title: 'Reuniões',
          icon: Calendar,
          href: '/meetings',
          roles: ['admin', 'manager'],
        },
        {
          title: 'Metas',
          icon: Target,
          href: '/goals',
          roles: ['admin', 'manager'],
        },
      ],
    },
    {
      title: 'Relatórios',
      icon: BarChart3,
      href: '/reports',
      roles: ['admin', 'manager'],
    },
  ]

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupTitle)) {
        newSet.delete(groupTitle)
      } else {
        newSet.add(groupTitle)
      }
      return newSet
    })
  }

  const filteredMenuItems = menuItems.filter(item => {
    if (item.isGroup) {
      // Para grupos, verificar se pelo menos um filho tem acesso
      return item.children?.some(child => {
        if (!child.roles.includes(userRole)) return false
        if (child.href === '/meetings') {
          if (!userId) return false
          return allowedMeetingUserIds.includes(userId)
        }
        return true
      }) || false
    }
    
    if (!item.roles.includes(userRole)) return false
    if (item.href === '/meetings') {
      if (!userId) return false
      return allowedMeetingUserIds.includes(userId)
    }
    return true
  })

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
        setUserId(user.id)
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

        <nav className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide p-2">
            <ul className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                const isGroup = item.isGroup
                const isExpanded = expandedGroups.has(item.title)
                
                if (isGroup) {
                  return (
                    <li key={item.title}>
                      <button
                        onClick={() => toggleGroup(item.title)}
                        className={cn(
                          "w-full flex items-center rounded-xl text-sm font-roboto font-medium transition-all duration-300",
                          shouldExpand ? "px-4 py-2" : "justify-center px-2 py-2",
                          "text-white hover:bg-gray-700 hover:text-white"
                        )}
                        title={!shouldExpand ? item.title : undefined}
                      >
                        <Icon className={cn(
                          "flex-shrink-0",
                          shouldExpand ? "w-4 h-4 mr-3" : "w-4 h-4"
                        )} />
                        {shouldExpand && (
                          <>
                            <span className="tracking-wide text-xs flex-1 text-left">{item.title}</span>
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-transform duration-200",
                              isExpanded ? "rotate-180" : ""
                            )} />
                          </>
                        )}
                      </button>
                      
                      {shouldExpand && isExpanded && item.children && (
                        <ul className="ml-4 mt-1 space-y-1">
                          {item.children
                            .filter(child => {
                              if (!child.roles.includes(userRole)) return false
                              if (child.href === '/meetings') {
                                if (!userId) return false
                                return allowedMeetingUserIds.includes(userId)
                              }
                              return true
                            })
                            .map((child) => {
                              const ChildIcon = child.icon
                              const isChildActive = pathname === child.href
                              
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    className={cn(
                                      "flex items-center rounded-xl text-sm font-roboto font-medium transition-all duration-300",
                                      "px-4 py-2",
                                      isChildActive 
                                        ? "bg-gray-700 text-white shadow-sm" 
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                    )}
                                  >
                                    <ChildIcon className="w-4 h-4 mr-3 flex-shrink-0" />
                                    <span className="tracking-wide text-xs">{child.title}</span>
                                  </Link>
                                </li>
                              )
                            })}
                        </ul>
                      )}
                    </li>
                  )
                }
                
                return (
                  <li key={item.href || item.title}>
                    <Link
                      href={item.href || '#'}
                      className={cn(
                        "flex items-center rounded-xl text-sm font-roboto font-medium transition-all duration-300",
                        shouldExpand ? "px-4 py-2" : "justify-center px-2 py-2",
                        isActive 
                          ? "bg-gray-700 text-white shadow-sm" 
                          : "text-white hover:bg-gray-700 hover:text-white"
                      )}
                      title={!shouldExpand ? item.title : undefined}
                    >
                      <Icon className={cn(
                        "flex-shrink-0",
                        shouldExpand ? "w-4 h-4 mr-3" : "w-4 h-4"
                      )} />
                      {shouldExpand && <span className="tracking-wide text-xs">{item.title}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="border-t border-gray-600 pt-2 mt-2 flex-shrink-0 p-2">
            <div className="mb-2 space-y-1">
              <Link
                href="/profile"
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-roboto font-medium text-white hover:bg-gray-700 hover:text-white transition-all duration-300",
                  shouldExpand ? "px-4 py-2" : "justify-center px-2 py-2"
                )}
                title={!shouldExpand ? "Meu Perfil" : undefined}
              >
                <UserCircle className={cn(
                  "flex-shrink-0",
                  shouldExpand ? "w-4 h-4 mr-3" : "w-4 h-4"
                )} />
                {shouldExpand && <span className="tracking-wide text-xs">Meu Perfil</span>}
              </Link>

              <Link
                href="/"
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-roboto font-medium text-white hover:bg-gray-700 hover:text-white transition-all duration-300",
                  shouldExpand ? "px-4 py-2" : "justify-center px-2 py-2"
                )}
                title={!shouldExpand ? "Início" : undefined}
              >
                <Home className={cn(
                  "flex-shrink-0",
                  shouldExpand ? "w-4 h-4 mr-3" : "w-4 h-4"
                )} />
                {shouldExpand && <span className="tracking-wide text-xs">Início</span>}
              </Link>

              <button
                onClick={handleLogout}
                className={cn(
                  "w-full flex items-center rounded-xl text-sm font-roboto font-medium text-white hover:bg-red-600 hover:text-white transition-all duration-300",
                  shouldExpand ? "px-4 py-2" : "justify-center px-2 py-2"
                )}
                title={!shouldExpand ? "Sair" : undefined}
              >
                <LogOut className={cn(
                  "flex-shrink-0",
                  shouldExpand ? "w-4 h-4 mr-3" : "w-4 h-4"
                )} />
                {shouldExpand && <span className="tracking-wide text-xs">Sair</span>}
              </button>
            </div>
          </div>
        </nav>
      </aside>
    </>
  )
}