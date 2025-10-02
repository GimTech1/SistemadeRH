'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface InactivityModalProps {
  isOpen: boolean
  onClose: () => void
  onExtend: () => void
  timeRemaining: number
}

export function InactivityModal({ isOpen, onClose, onExtend, timeRemaining }: InactivityModalProps) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
          Sessão Expirando
        </h3>
        
        <p className="text-gray-600 text-center mb-4">
          Sua sessão expirará em <span className="font-semibold text-red-600">{formatTime(timeRemaining)}</span> devido à inatividade.
        </p>
        
        <p className="text-sm text-gray-500 text-center mb-6">
          Clique em "Continuar" para manter sua sessão ativa ou "Sair" para fazer logout.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Sair
          </button>
          <button
            onClick={onExtend}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}
