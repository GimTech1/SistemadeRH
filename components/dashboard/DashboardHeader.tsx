'use client'

import { Menu, UserCircle } from 'lucide-react'
    import { cn } from '@/lib/utils'

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
  return (
    <header className={cn(
      'sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-platinum-200',
      className
    )}>
      <div className="w-full px-2 md:px-4 py-3 md:py-5 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="md:hidden mr-3 text-oxford-blue-700 hover:text-oxford-blue-900"
            aria-label="Abrir menu"
            onClick={onOpenMenu}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1
            className="text-xl md:text-2xl font-roboto tracking-wide text-rich-black-900"
            style={{ fontWeight: 300 }}
          >
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Bloco de perfil movido da sidebar para a header */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-yinmn-blue-50/50 border border-yinmn-blue-100/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yinmn-blue-500 to-yinmn-blue-600 flex items-center justify-center overflow-hidden shadow-sm ring-2 ring-white/50">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 hidden md:block">
              <p className="text-rich-black-900 text-sm font-roboto font-medium truncate tracking-wide">{userName || 'Usuário'}</p>
              <p className="text-oxford-blue-600 text-xs font-roboto font-light truncate tracking-wide">{userPosition || 'Perfil'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}



