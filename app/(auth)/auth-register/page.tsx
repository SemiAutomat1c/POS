'use client';

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const storeName = formData.get('storeName') as string
    const username = email.split('@')[0]

    if (!email || !password || !storeName) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      console.log('Starting auth registration process...');
      
      const response = await fetch('/api/auth-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          username,
          storeName,
          storeAddress: 'Default Address',
          storePhone: '000-000-0000',
        }),
      });

      // Check response content type
      const contentType = response.headers.get('content-type');
      console.log('Response content type:', contentType);
      
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText.substring(0, 200)); // Log first 200 chars
        
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error(`Failed to parse server response: ${responseText.substring(0, 100)}`);
        }
      } catch (textError) {
        console.error('Error reading response text:', textError);
        throw new Error('Failed to read server response');
      }
      
      console.log('Registration response:', {
        status: response.status,
        ok: response.ok,
        data
      });

      if (!response.ok) {
        const errorMessage = data?.error || 'Registration failed';
        console.error('Registration error details:', {
          status: response.status,
          message: errorMessage,
          fullData: JSON.stringify(data),
          error: data?.error
        });
        throw new Error(errorMessage);
      }

      // Success
      setSuccess(true);
      setRegisteredEmail(email);
      console.log('Registration successful');
      
    } catch (err: any) {
      console.error('Registration error:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Registration Successful
            </h2>
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Account created successfully
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your account for <strong>{registeredEmail}</strong> has been created.</p>
                    <p className="mt-2">You can now proceed to login.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your store account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Auth Registration (Using Supabase Auth)
          </p>
          <div className="mt-2 bg-yellow-50 p-2 rounded text-center text-yellow-800 text-sm">
            This uses Supabase Auth for registration
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password (minimum 6 characters)"
              />
            </div>
            <div>
              <label htmlFor="storeName" className="sr-only">Store name</label>
              <input
                id="storeName"
                name="storeName"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Store name"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Registration failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
          
          <div className="text-center mt-2">
            <Link href="/register" className="text-sm text-indigo-600 hover:text-indigo-500">
              Return to standard registration
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
} 