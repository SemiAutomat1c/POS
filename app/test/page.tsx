'use client'

import { useEffect, useState } from 'react'
import { testSupabaseConnection } from '@/lib/test-connection'

export default function TestPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testSupabaseConnection()
      .then((success) => {
        setStatus(success ? 'success' : 'error')
      })
      .catch((err) => {
        setStatus('error')
        setError(err.message)
      })
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {status === 'loading' && (
        <p className="text-gray-600">Testing connection...</p>
      )}
      
      {status === 'success' && (
        <p className="text-green-600">✅ Connection successful!</p>
      )}
      
      {status === 'error' && (
        <div>
          <p className="text-red-600">❌ Connection failed</p>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  )
} 