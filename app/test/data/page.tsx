'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/storage/supabase'
import { DatabaseAdapter } from '@/lib/db-adapter'

const db = new DatabaseAdapter()

interface TestResult {
  name: string
  status: 'loading' | 'success' | 'error'
  data?: any
  error?: string
}

export default function DataTestPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [user, setUser] = useState<any>(null)

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result])
  }

  const runTests = async () => {
    // Clear previous results
    setResults([])

    // Test 1: Check Authentication
    addResult({ name: 'Authentication Check', status: 'loading' })
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      setUser(user)
      addResult({
        name: 'Authentication Check',
        status: 'success',
        data: `Authenticated as ${user?.email}`
      })
    } catch (error: any) {
      addResult({
        name: 'Authentication Check',
        status: 'error',
        error: error.message
      })
      return // Stop tests if not authenticated
    }

    // Test 2: Get Products
    addResult({ name: 'Get Products', status: 'loading' })
    try {
      const products = await db.getProducts()
      addResult({
        name: 'Get Products',
        status: 'success',
        data: `Found ${products.length} products`
      })
    } catch (error: any) {
      addResult({
        name: 'Get Products',
        status: 'error',
        error: error.message
      })
    }

    // Test 3: Get Customers
    addResult({ name: 'Get Customers', status: 'loading' })
    try {
      const customers = await db.getCustomers()
      addResult({
        name: 'Get Customers',
        status: 'success',
        data: `Found ${customers.length} customers`
      })
    } catch (error: any) {
      addResult({
        name: 'Get Customers',
        status: 'error',
        error: error.message
      })
    }

    // Test 4: Get Sales
    addResult({ name: 'Get Sales', status: 'loading' })
    try {
      const sales = await db.getSales()
      addResult({
        name: 'Get Sales',
        status: 'success',
        data: `Found ${sales.length} sales`
      })
    } catch (error: any) {
      addResult({
        name: 'Get Sales',
        status: 'error',
        error: error.message
      })
    }

    // Test 5: Get Returns
    addResult({ name: 'Get Returns', status: 'loading' })
    try {
      const returns = await db.getReturns()
      addResult({
        name: 'Get Returns',
        status: 'success',
        data: `Found ${returns.length} returns`
      })
    } catch (error: any) {
      addResult({
        name: 'Get Returns',
        status: 'error',
        error: error.message
      })
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Database Operations Test</h1>
      
      {user && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700">
            Logged in as: {user.email}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`p-4 rounded ${
              result.status === 'loading' ? 'bg-gray-50 border border-gray-200' :
              result.status === 'success' ? 'bg-green-50 border border-green-200' :
              'bg-red-50 border border-red-200'
            }`}
          >
            <h2 className="font-semibold">{result.name}</h2>
            
            {result.status === 'loading' && (
              <p className="text-gray-600">Testing...</p>
            )}
            
            {result.status === 'success' && (
              <p className="text-green-600">✅ {result.data}</p>
            )}
            
            {result.status === 'error' && (
              <p className="text-red-600">❌ {result.error}</p>
            )}
          </div>
        ))}
      </div>

      {results.length > 0 && (
        <button
          onClick={runTests}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Tests Again
        </button>
      )}
    </div>
  )
} 