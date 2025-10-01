'use client'

import { Menu, UserCircle, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type DashboardHeaderProps = {
  title?: string
  onOpenMenu?: () => void
  onNotificationClick?: () => void
  hasUnread?: boolean
  unreadCount?: number
  userName?: string
  userPosition?: string
  className?: string
}

export default function DashboardHeader({
  title = 'Meu Dashboard',
  onOpenMenu,
  onNotificationClick,
  hasUnread = false,
  unreadCount = 0,
  userName,
  userPosition,
  className,
}: DashboardHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const loadUserAvatar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: employee } = await supabase
          .from('employees')
          .select('avatar_url')
          .eq('id', user.id)
          .single()

        if (employee && (employee as any).avatar_url) {
          setUserAvatar((employee as any).avatar_url)
        }
      } catch (error) {
      }
    }

    loadUserAvatar()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className={cn(
      'sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-platinum-200',
      className
    )}>
      <div className="w-full px-2 md:px-4 py-1 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 text-oxford-blue-700 hover:text-oxford-blue-900"
            aria-label="Abrir menu"
            onClick={onOpenMenu}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className="text-lg md:text-xl font-roboto tracking-wide text-rich-black-900"
            style={{ fontWeight: 300 }}
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-platinum-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white/50">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt="Avatar do usuário"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="min-w-0 hidden md:block">
                <p className="text-rich-black-900 text-sm font-roboto font-medium truncate tracking-wide">{userName || 'Usuário'}</p>
                <p className="text-oxford-blue-600 text-xs font-roboto font-light truncate tracking-wide">{userPosition || 'Perfil'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-oxford-blue-600" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-platinum-200 py-2 z-50">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-rich-black-900 hover:bg-platinum-100 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Editar Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}



