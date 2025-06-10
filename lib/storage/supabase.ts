import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'
import { localDB } from './indexeddb'

// Create a singleton instance of Supabase client to use throughout the app
// This prevents the "Multiple GoTrueClient instances" warning
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance;
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.error('Missing Supabase credentials');
    throw new Error('Missing Supabase credentials');
  }
  
  supabaseInstance = createClient<Database>(
    url,
    key,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
      },
      global: {
        headers: {
          'x-application-name': 'gadget-track-pos',
        },
      },
    }
  );
  
  return supabaseInstance;
})();

// Export a function that ensures we're using the same client instance
export const getSupabaseClient = () => {
  return supabase;
};

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