'use client'

interface InactivityIndicatorProps {
  timeLeft: number
  isWarning: boolean
}

export function InactivityIndicator({ timeLeft, isWarning }: InactivityIndicatorProps) {
  if (!isWarning) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed top-4 right-4 z-40 bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2 shadow-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-yellow-800">
          Sessão expira em: {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  )
}
