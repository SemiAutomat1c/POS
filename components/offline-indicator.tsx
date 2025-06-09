"use client"

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [isHidden, setIsHidden] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOffline(false)
      // Keep the "back online" message visible briefly
      setTimeout(() => setIsHidden(true), 3000)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setIsHidden(false)
    }

    // Check initial state
    setIsOffline(!window.navigator.onLine)
    setIsHidden(window.navigator.onLine)

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isHidden) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg',
        isOffline
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-green-500 text-white'
      )}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You are offline. Some features may be limited.</span>
        </>
      ) : (
        <span>You're back online!</span>
      )}
    </div>
  )
} 