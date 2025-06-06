import { Database } from './storage/supabase-types'
import { supabase } from './storage/supabase'
import { localDB } from './storage/indexeddb'

type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Store = Tables['stores']['Row']
type Subscription = Tables['subscriptions']['Row']

export class DatabaseAdapter {
  async getUser(id: string): Promise<User | null> {
    try {
      // Try local first
      const localUser = await localDB.getUser(id)
      if (localUser) return localUser

      // Fallback to Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!user) return null

      // Cache in IndexedDB
      await localDB.saveUser(user)
      return user
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      // Try local first
      const localUser = await localDB.getUserByEmail(email)
      if (localUser) return localUser

      // Fallback to Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) throw error
      if (!user) return null

      // Cache in IndexedDB
      await localDB.saveUser(user)
      return user
    } catch (error) {
      console.error('Error getting user by email:', error)
      return null
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      if (!user) return null

      // Cache in IndexedDB
      await localDB.saveUser(user)
      return user
    } catch (error) {
      console.error('Error getting user by username:', error)
      return null
    }
  }

  async getStore(id: string): Promise<Store | null> {
    try {
      // Try local first
      const localStore = await localDB.getStore(id)
      if (localStore) return localStore

      // Fallback to Supabase
      const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!store) return null

      // Cache in IndexedDB
      await localDB.saveStore(store)
      return store
    } catch (error) {
      console.error('Error getting store:', error)
      return null
    }
  }

  async addUser(userData: Tables['users']['Insert']): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) throw error
      if (!user) return null

      // Cache in IndexedDB
      await localDB.saveUser(user)
      return user
    } catch (error) {
      console.error('Error adding user:', error)
      return null
    }
  }

  async updateUser(id: string, data: Tables['users']['Update']): Promise<User | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!user) return null

      // Cache in IndexedDB
      await localDB.saveUser(user)
      return user
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }

  async getProducts() {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('*')

      if (error) throw error
      return products || []
    } catch (error) {
      console.error('Error getting products:', error)
      return []
    }
  }

  async addProduct(productData: any) {
    try {
      const { data: product, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (error) throw error
      return product
    } catch (error) {
      console.error('Error adding product:', error)
      return null
    }
  }

  async getCustomers() {
    try {
      const { data: customers, error } = await supabase
        .from('customers')
        .select('*')

      if (error) throw error
      return customers || []
    } catch (error) {
      console.error('Error getting customers:', error)
      return []
    }
  }

  async addCustomer(customerData: any) {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) throw error
      return customer
    } catch (error) {
      console.error('Error adding customer:', error)
      return null
    }
  }

  async getSales() {
    try {
      const { data: sales, error } = await supabase
        .from('sales')
        .select('*')

      if (error) throw error
      return sales || []
    } catch (error) {
      console.error('Error getting sales:', error)
      return []
    }
  }

  async getReturns() {
    try {
      const { data: returns, error } = await supabase
        .from('returns')
        .select('*')

      if (error) throw error
      return returns || []
    } catch (error) {
      console.error('Error getting returns:', error)
      return []
    }
  }

  async addStore(storeData: Tables['stores']['Insert']): Promise<Store | null> {
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .insert([storeData])
        .select()
        .single()

      if (error) throw error
      if (!store) return null

      // Cache in IndexedDB
      await localDB.saveStore(store)
      return store
    } catch (error) {
      console.error('Error adding store:', error)
      return null
    }
  }

  async updateStore(id: string, data: Tables['stores']['Update']): Promise<Store | null> {
    try {
      const { data: store, error } = await supabase
        .from('stores')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!store) return null

      // Cache in IndexedDB
      await localDB.saveStore(store)
      return store
    } catch (error) {
      console.error('Error updating store:', error)
      return null
    }
  }

  async getSubscription(id: string): Promise<Subscription | null> {
    try {
      // Try local first
      const localSubscription = await localDB.getSubscription(id)
      if (localSubscription) return localSubscription

      // Fallback to Supabase
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!subscription) return null

      // Cache in IndexedDB
      await localDB.saveSubscription(subscription)
      return subscription
    } catch (error) {
      console.error('Error getting subscription:', error)
      return null
    }
  }

  async getSubscriptionByUser(userId: string): Promise<Subscription | null> {
    try {
      // Try local first
      const localSubscription = await localDB.getSubscriptionByUser(userId)
      if (localSubscription) return localSubscription

      // Fallback to Supabase
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('userId', userId)
        .single()

      if (error) throw error
      if (!subscription) return null

      // Cache in IndexedDB
      await localDB.saveSubscription(subscription)
      return subscription
    } catch (error) {
      console.error('Error getting subscription by user:', error)
      return null
    }
  }

  async addSubscription(subscriptionData: Tables['subscriptions']['Insert']): Promise<Subscription | null> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single()

      if (error) throw error
      if (!subscription) return null

      // Cache in IndexedDB
      await localDB.saveSubscription(subscription)
      return subscription
    } catch (error) {
      console.error('Error adding subscription:', error)
      return null
    }
  }

  async updateSubscription(id: string, data: Tables['subscriptions']['Update']): Promise<Subscription | null> {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      if (!subscription) return null

      // Cache in IndexedDB
      await localDB.saveSubscription(subscription)
      return subscription
    } catch (error) {
      console.error('Error updating subscription:', error)
      return null
    }
  }

  async initializeDB() {
    await localDB.connect()
  }
}

export const db = new DatabaseAdapter()

// Re-export methods for backward compatibility
export const { 
  getUser: getUserById,
  getUserByEmail,
  getUserByUsername,
  getStore: getStoreById,
  addUser,
  updateUser,
  getProducts,
  addProduct,
  getCustomers,
  addCustomer,
  getSales,
  getReturns,
  addStore,
  updateStore,
  getSubscription,
  getSubscriptionByUser,
  addSubscription,
  updateSubscription,
  initializeDB
} = db 