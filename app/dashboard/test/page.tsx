"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/storage/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

export default function DashboardTestPage() {
  const [user, setUser] = useState<any>(null)
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [databaseTestResults, setDatabaseTestResults] = useState<{
    usersTable: { success: boolean; message: string; data?: any };
    storesTable: { success: boolean; message: string; data?: any };
  }>({
    usersTable: { success: false, message: "Not tested yet" },
    storesTable: { success: false, message: "Not tested yet" },
  })
  const router = useRouter()

  useEffect(() => {
    async function getUser() {
      try {
        setLoading(true)
        // Get user data
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error fetching user:', userError)
          return
        }
        
        // Get session data
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error fetching session:', sessionError)
        } else {
          setSessionInfo(session)
        }
        
        if (user) {
          console.log('Found authenticated user:', user.id)
          setUser(user)
          
          // Test database access
          await testDatabaseAccess(user.id)
        } else {
          console.log('No authenticated user found')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])
  
  // Test database access
  const testDatabaseAccess = async (userId: string) => {
    // Test users table
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
        
      if (userError) {
        setDatabaseTestResults(prev => ({
          ...prev,
          usersTable: { 
            success: false, 
            message: `Error querying users table: ${userError.message}` 
          }
        }))
      } else {
        setDatabaseTestResults(prev => ({
          ...prev,
          usersTable: { 
            success: true, 
            message: "Successfully queried users table",
            data: userData
          }
        }))
      }
    } catch (error: any) {
      setDatabaseTestResults(prev => ({
        ...prev,
        usersTable: { 
          success: false, 
          message: `Exception querying users table: ${error.message}` 
        }
      }))
    }
    
    // Test stores table (if we have a user with store_id)
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('store_id')
        .eq('id', userId)
        .single()
        
      if (userData?.store_id) {
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('id', userData.store_id)
          .single()
          
        if (storeError) {
          setDatabaseTestResults(prev => ({
            ...prev,
            storesTable: { 
              success: false, 
              message: `Error querying stores table: ${storeError.message}` 
            }
          }))
        } else {
          setDatabaseTestResults(prev => ({
            ...prev,
            storesTable: { 
              success: true, 
              message: "Successfully queried stores table",
              data: storeData
            }
          }))
        }
      } else {
        setDatabaseTestResults(prev => ({
          ...prev,
          storesTable: { 
            success: false, 
            message: "No store_id found for this user" 
          }
        }))
      }
    } catch (error: any) {
      setDatabaseTestResults(prev => ({
        ...prev,
        storesTable: { 
          success: false, 
          message: `Exception querying stores table: ${error.message}` 
        }
      }))
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we check your authentication.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <div>
                <Badge className="mb-4 bg-green-600">Authenticated</Badge>
                <div className="grid gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold">User ID:</span>
                    <code className="bg-muted p-1 rounded text-xs">{user.id}</code>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Last Sign In:</span>
                    <span>{new Date(user.last_sign_in_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Badge className="mb-4 bg-red-600">Not Authenticated</Badge>
                <p>You are not authenticated. You should be redirected to the login page automatically.</p>
                <p>If you are seeing this message, there might be an issue with the authentication flow.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionInfo ? (
              <div>
                <Badge className="mb-4 bg-green-600">Active Session</Badge>
                <div className="grid gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold">Session ID:</span>
                    <code className="bg-muted p-1 rounded text-xs">{sessionInfo.id}</code>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Created At:</span>
                    <span>{new Date(sessionInfo.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Expires At:</span>
                    <span>{new Date(sessionInfo.expires_at * 1000).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Badge className="mb-4 bg-red-600">No Active Session</Badge>
                <p>No active session found.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="mb-8 md:col-span-2">
          <CardHeader>
            <CardTitle>Database Access Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">Users Table</h3>
                <Badge className={`mb-4 ${databaseTestResults.usersTable.success ? 'bg-green-600' : 'bg-red-600'}`}>
                  {databaseTestResults.usersTable.success ? 'Success' : 'Failed'}
                </Badge>
                <p className="text-sm mb-2">{databaseTestResults.usersTable.message}</p>
                {databaseTestResults.usersTable.data && (
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer text-sm text-blue-500">View User Data</summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-[200px]">
                        {JSON.stringify(databaseTestResults.usersTable.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">Stores Table</h3>
                <Badge className={`mb-4 ${databaseTestResults.storesTable.success ? 'bg-green-600' : 'bg-red-600'}`}>
                  {databaseTestResults.storesTable.success ? 'Success' : 'Failed'}
                </Badge>
                <p className="text-sm mb-2">{databaseTestResults.storesTable.message}</p>
                {databaseTestResults.storesTable.data && (
                  <div className="mt-2">
                    <details>
                      <summary className="cursor-pointer text-sm text-blue-500">View Store Data</summary>
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto max-h-[200px]">
                        {JSON.stringify(databaseTestResults.storesTable.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <p className="font-medium mb-2">Recommended actions:</p>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Check that your database has the expected tables: users, stores, products, customers, sales, returns</li>
                <li>Verify that your user account has appropriate permissions</li>
                <li>Check that foreign key relationships are correctly set up</li>
                <li>Ensure your Supabase RLS (Row Level Security) policies are configured correctly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/dashboard">Go to Main Dashboard</Link>
        </Button>
        
        {user && (
          <Button variant="destructive" onClick={handleLogout}>
            Sign Out
          </Button>
        )}
      </div>
    </div>
  )
} 