'use client'

import { useStorage } from '@/hooks/useStorage'
import { ReactNode, useEffect, useState } from 'react'

interface StorageProviderProps {
  children: ReactNode
}

export function StorageProvider({ children }: StorageProviderProps) {
  const [isMounted, setIsMounted] = useState(false)
  const { isInitialized, error } = useStorage()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During SSR or before mount, render children directly
  if (!isMounted) {
    return <>{children}</>
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Storage Error</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Initializing Storage...</h2>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 