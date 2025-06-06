import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Database } from './supabase-types'

type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Store = Tables['stores']['Row']
type Subscription = Tables['subscriptions']['Row']

type SyncStatus = 'pending' | 'synced' | 'error'

interface SyncedEntity {
  syncStatus: SyncStatus
  lastModified: number
}

interface POSDatabase extends DBSchema {
  users: {
    key: string
    value: User & SyncedEntity
    indexes: { 'by-email': string }
  }
  stores: {
    key: string
    value: Store & SyncedEntity
  }
  subscriptions: {
    key: string
    value: Subscription & SyncedEntity
    indexes: { 'by-user': string, 'by-store': string }
  }
  syncQueue: {
    key: string
    value: {
      operation: 'create' | 'update' | 'delete'
      table: string
      data: any
      timestamp: number
      attempts: number
    }
  }
}

const DB_NAME = 'pos_system'
const DB_VERSION = 1

export async function initDB(): Promise<IDBPDatabase<POSDatabase>> {
  return openDB<POSDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Users store
      if (!db.objectStoreNames.contains('users')) {
        const userStore = db.createObjectStore('users', { keyPath: 'id' })
        userStore.createIndex('by-email', 'email', { unique: true })
      }

      // Stores store
      if (!db.objectStoreNames.contains('stores')) {
        db.createObjectStore('stores', { keyPath: 'id' })
      }

      // Subscriptions store
      if (!db.objectStoreNames.contains('subscriptions')) {
        const subscriptionStore = db.createObjectStore('subscriptions', { keyPath: 'id' })
        subscriptionStore.createIndex('by-user', 'userId', { unique: false })
        subscriptionStore.createIndex('by-store', 'storeId', { unique: false })
      }

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { 
          keyPath: 'id',
          autoIncrement: true 
        })
      }
    },
  })
}

export class IndexedDBStorage {
  private db: IDBPDatabase<POSDatabase> | null = null

  async connect(): Promise<void> {
    this.db = await initDB()
  }

  async getUser(id: string): Promise<User | null> {
    if (!this.db) await this.connect()
    const result = await this.db!.get('users', id)
    if (!result) return null
    
    // Remove sync-related fields when returning the user
    const { syncStatus, lastModified, ...user } = result
    return user
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) await this.connect()
    const result = await this.db!.getFromIndex('users', 'by-email', email)
    if (!result) return null
    
    // Remove sync-related fields when returning the user
    const { syncStatus, lastModified, ...user } = result
    return user
  }

  async saveUser(user: User): Promise<void> {
    if (!this.db) await this.connect()
    await this.db!.put('users', {
      ...user,
      syncStatus: 'pending' as const,
      lastModified: Date.now()
    })
    await this.addToSyncQueue('create', 'users', user)
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    if (!this.db) await this.connect()
    const existingUser = await this.getUser(id)
    if (!existingUser) throw new Error('User not found')

    const updatedUser = {
      ...existingUser,
      ...data,
      syncStatus: 'pending' as const,
      lastModified: Date.now()
    }

    await this.db!.put('users', updatedUser)
    await this.addToSyncQueue('update', 'users', updatedUser)
  }

  async getStore(id: string): Promise<Store | null> {
    if (!this.db) await this.connect()
    const result = await this.db!.get('stores', id)
    if (!result) return null
    
    // Remove sync-related fields when returning the store
    const { syncStatus, lastModified, ...store } = result
    return store
  }

  async saveStore(store: Store): Promise<void> {
    if (!this.db) await this.connect()
    await this.db!.put('stores', {
      ...store,
      syncStatus: 'pending' as const,
      lastModified: Date.now()
    })
    await this.addToSyncQueue('create', 'stores', store)
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    if (!this.db) await this.connect()
    const result = await this.db!.get('subscriptions', id)
    if (!result) return null
    
    // Remove sync-related fields when returning the subscription
    const { syncStatus, lastModified, ...subscription } = result
    return subscription
  }

  async getSubscriptionByUser(userId: string): Promise<Subscription | null> {
    if (!this.db) await this.connect()
    const result = await this.db!.getFromIndex('subscriptions', 'by-user', userId)
    if (!result) return null
    
    // Remove sync-related fields when returning the subscription
    const { syncStatus, lastModified, ...subscription } = result
    return subscription
  }

  async getSubscriptionByStore(storeId: string): Promise<Subscription | null> {
    if (!this.db) await this.connect()
    const result = await this.db!.getFromIndex('subscriptions', 'by-store', storeId)
    if (!result) return null
    
    // Remove sync-related fields when returning the subscription
    const { syncStatus, lastModified, ...subscription } = result
    return subscription
  }

  async saveSubscription(subscription: Subscription): Promise<void> {
    if (!this.db) await this.connect()
    await this.db!.put('subscriptions', {
      ...subscription,
      syncStatus: 'pending' as const,
      lastModified: Date.now()
    })
    await this.addToSyncQueue('create', 'subscriptions', subscription)
  }

  async updateSubscription(id: string, data: Partial<Subscription>): Promise<void> {
    if (!this.db) await this.connect()
    const existingSubscription = await this.getSubscription(id)
    if (!existingSubscription) throw new Error('Subscription not found')

    const updatedSubscription = {
      ...existingSubscription,
      ...data,
      syncStatus: 'pending' as const,
      lastModified: Date.now()
    }

    await this.db!.put('subscriptions', updatedSubscription)
    await this.addToSyncQueue('update', 'subscriptions', updatedSubscription)
  }

  private async addToSyncQueue(
    operation: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ): Promise<void> {
    if (!this.db) await this.connect()
    await this.db!.add('syncQueue', {
      operation,
      table,
      data,
      timestamp: Date.now(),
      attempts: 0
    })
  }

  async getPendingSyncOperations(): Promise<any[]> {
    if (!this.db) await this.connect()
    return this.db!.getAll('syncQueue')
  }

  async clearSyncOperation(id: string): Promise<void> {
    if (!this.db) await this.connect()
    await this.db!.delete('syncQueue', id)
  }
}

export const localDB = new IndexedDBStorage() 