import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'
import { localDB } from './indexeddb'

const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Missing NEXT_PUBLIC_SUPABASE_URL - using fallback URL for development')
      return 'http://localhost:54321' // Default Supabase local development URL
    }
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL')
  }
  return url
}

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY - using fallback key for development')
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' // Default local development anon key
    }
    throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return key
}

export const supabase = createClient<Database>(
  getSupabaseUrl(),
  getSupabaseAnonKey(),
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

export class SyncManager {
  private syncInterval: NodeJS.Timeout | null = null
  private isSyncing = false

  constructor(private syncIntervalMs = 30000) {} // Default 30 seconds

  startSync(): void {
    if (this.syncInterval) return

    this.syncInterval = setInterval(() => {
      this.sync().catch(console.error)
    }, this.syncIntervalMs)

    // Initial sync
    this.sync().catch(console.error)
  }

  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  private async sync(): Promise<void> {
    if (this.isSyncing) return
    this.isSyncing = true

    try {
      const operations = await localDB.getPendingSyncOperations()
      
      for (const op of operations) {
        try {
          switch (op.table) {
            case 'users':
              await this.syncUser(op)
              break
            case 'stores':
              await this.syncStore(op)
              break
            case 'subscriptions':
              await this.syncSubscription(op)
              break
          }
          
          await localDB.clearSyncOperation(op.id)
        } catch (error) {
          console.error(`Sync operation failed:`, error)
          // Could implement retry logic here
        }
      }
    } finally {
      this.isSyncing = false
    }
  }

  private async syncUser(operation: any): Promise<void> {
    const { data, error } = await supabase
      .from('users')
      .upsert(operation.data, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })

    if (error) throw error
  }

  private async syncStore(operation: any): Promise<void> {
    const { data, error } = await supabase
      .from('stores')
      .upsert(operation.data, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })

    if (error) throw error
  }

  private async syncSubscription(operation: any): Promise<void> {
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(operation.data, {
        onConflict: 'id',
        ignoreDuplicates: false,
      })

    if (error) throw error
  }
}

// Create a singleton instance
export const syncManager = new SyncManager()

// Helper function to initialize storage and sync
export async function initializeStorage(): Promise<void> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return
  }

  try {
    // Initialize IndexedDB
    await localDB.connect()
    
    // Start sync manager
    syncManager.startSync()
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('App is online')
      syncManager.startSync()
    })
    
    window.addEventListener('offline', () => {
      console.log('App is offline')
      syncManager.stopSync()
    })
  } catch (error) {
    console.error('Failed to initialize storage:', error)
    throw error
  }
} 