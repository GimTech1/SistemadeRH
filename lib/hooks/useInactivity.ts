'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface UseInactivityOptions {
  warningTime?: number 
  logoutTime?: number 
  events?: string[] 
}

export function useInactivity({
  warningTime = 5 * 60, 
  logoutTime = 30 * 60, 
  events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'focus']
}: UseInactivityOptions = {}) {
  const [timeLeft, setTimeLeft] = useState(logoutTime)
  const [isWarning, setIsWarning] = useState(false)
  const [isLoggedOut, setIsLoggedOut] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(true)
  const resetTimer = useCallback(() => {
    setTimeLeft(logoutTime)
    setIsWarning(false)
    setIsLoggedOut(false)
    isActiveRef.current = true
  }, [logoutTime])

  const extendSession = useCallback(() => {
    resetTimer()
  }, [resetTimer])

  const handleActivity = useCallback(() => {
    if (!isLoggedOut && isActiveRef.current) {
      resetTimer()
    }
  }, [isLoggedOut, resetTimer])

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setIsLoggedOut(true)
          isActiveRef.current = false
          return 0
        }
        
        const newTime = prev - 1
        if (newTime <= warningTime && !isWarning && isActiveRef.current) {
          setIsWarning(true)
        }
        return newTime
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [warningTime, logoutTime, isWarning, isLoggedOut, handleActivity, events])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    timeLeft,
    isWarning,
    isLoggedOut,
    extendSession,
    resetTimer
  }
}
