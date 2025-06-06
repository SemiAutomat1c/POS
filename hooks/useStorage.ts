import { useEffect, useState } from 'react'
import { initializeStorage } from '@/lib/storage/supabase'

export function useStorage() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        await initializeStorage()
        if (mounted) {
          setIsInitialized(true)
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize storage'))
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  // If we're on the server, return initialized as true to avoid SSR issues
  if (typeof window === 'undefined') {
    return { isInitialized: true, error: null }
  }

  return { isInitialized, error }
} 