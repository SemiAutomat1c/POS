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

      if (error) {
        console.error('Error fetching user:', error)
        throw error
      }
      
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
      const { data: { user } } = await supabase.auth.getUser()
      
      // Return empty array instead of throwing for demo/landing pages
      if (!user) {
        console.log('No user found for getProducts, returning empty array')
        return []
      }

      const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.error('Error fetching user details for products:', userError)
        return []
      }

      if (!userDetails?.storeId) {
        console.log('No store associated with user or user details not found')
        return []
      }

      // Query using the correct field names from the schema
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          sku,
          serialNumber,
          quantity,
          price,
          cost,
          minStockLevel,
          categoryId,
          brand,
          model,
          color,
          storage,
          condition,
          storeId,
          createdAt,
          updatedAt
        `)
        .eq('storeId', userDetails.storeId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase error fetching products:', error)
        throw error
      }
      
      // Debug: Log products data structure
      if (products && products.length > 0) {
        console.log('Sample product data structure:', products[0])
      } else {
        console.log('No products found')
      }
      
      return products || []
    } catch (error) {
      console.error('Error getting products:', error)
      return []
    }
  }

  async addProduct(productData: any) {
    try {
      // Make sure storeId is used instead of store_id
      if (productData.store_id && !productData.storeId) {
        productData.storeId = productData.store_id;
        delete productData.store_id;
      }
      
      // Ensure field names match the schema
      const normalizedData = {
        name: productData.name,
        description: productData.description || null,
        sku: productData.sku || null,
        serialNumber: productData.serialNumber || productData.serial_number || null,
        quantity: productData.quantity,
        price: productData.price,
        cost: productData.cost,
        minStockLevel: productData.minStockLevel || productData.min_stock_level || 0,
        categoryId: productData.categoryId || productData.category_id || null,
        brand: productData.brand || null,
        model: productData.model || null,
        color: productData.color || null,
        storage: productData.storage || null,
        condition: productData.condition || 'new',
        storeId: productData.storeId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data: product, error } = await supabase
        .from('products')
        .insert([normalizedData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting product:', error);
        throw error;
      }
      
      return product;
    } catch (error) {
      console.error('Error adding product:', error);
      return null;
    }
  }

  async getCustomers() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Return empty array instead of throwing for demo/landing pages
      if (!user) {
        console.log('No user found for getCustomers, returning empty array')
        return []
      }

      // Debug: Log the user information to help diagnose the issue
      console.log('Current user:', user?.id, user?.email)

      const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.error('Error fetching user details:', userError)
        return []
      }

      if (!userDetails?.storeId) {
        console.log('No store associated with user or user details not found')
        return []
      }

      console.log('User store ID:', userDetails.storeId)
      
      // Query using the correct field names from the schema
      const { data: customers, error } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          email,
          phone,
          address,
          totalPurchases,
          lastPurchaseDate,
          createdAt,
          updatedAt,
          storeId
        `)
        .eq('storeId', userDetails.storeId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase error fetching customers:', error)
        throw error
      }
      
      // Debug: Log customer data structure
      if (customers && customers.length > 0) {
        console.log('Sample customer data structure:', customers[0])
      } else {
        console.log('No customers found')
      }
      
      return customers || []
    } catch (error) {
      console.error('Error getting customers:', error)
      return []
    }
  }

  async addCustomer(customerData: any) {
    try {
      // Make sure storeId is used instead of store_id
      if (customerData.store_id && !customerData.storeId) {
        customerData.storeId = customerData.store_id;
        delete customerData.store_id;
      }
      
      // Ensure field names match the schema
      const normalizedData = {
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        storeId: customerData.storeId,
        totalPurchases: customerData.totalPurchases || 0,
        lastPurchaseDate: customerData.lastPurchaseDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data: customer, error } = await supabase
        .from('customers')
        .insert([normalizedData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting customer:', error);
        throw error;
      }
      
      return customer;
    } catch (error) {
      console.error('Error adding customer:', error);
      return null;
    }
  }

  async getSales() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Return empty array instead of throwing for demo/landing pages
      if (!user) {
        console.log('No user found for getSales, returning empty array')
        return []
      }

      const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.error('Error fetching user details for sales:', userError)
        return []
      }

      if (!userDetails?.storeId) {
        console.log('No store associated with user or user details not found')
        return []
      }

      // Query using the correct field names from the schema
      const { data: sales, error } = await supabase
        .from('sales')
        .select(`
          id,
          customerId,
          storeId,
          userId,
          total,
          subtotal,
          tax,
          discount,
          paymentMethod,
          status,
          notes,
          createdAt,
          updatedAt
        `)
        .eq('storeId', userDetails.storeId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase error fetching sales:', error)
        throw error
      }
      
      // Debug: Log sales data structure
      if (sales && sales.length > 0) {
        console.log('Sample sales data structure:', sales[0])
      } else {
        console.log('No sales found')
      }
      
      return sales || []
    } catch (error) {
      console.error('Error getting sales:', error)
      return []
    }
  }

  async getReturns() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Return empty array instead of throwing for demo/landing pages
      if (!user) {
        console.log('No user found for getReturns, returning empty array')
        return []
      }

      const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (userError) {
        console.error('Error fetching user details for returns:', userError)
        return []
      }

      if (!userDetails?.storeId) {
        console.log('No store associated with user or user details not found')
        return []
      }

      // Query using the correct field names from the schema
      const { data: returns, error } = await supabase
        .from('returns')
        .select(`
          id,
          saleId,
          customerId,
          storeId,
          userId,
          total,
          reason,
          status,
          notes,
          createdAt,
          updatedAt
        `)
        .eq('storeId', userDetails.storeId)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase error fetching returns:', error)
        throw error
      }
      
      // Debug: Log returns data structure
      if (returns && returns.length > 0) {
        console.log('Sample returns data structure:', returns[0])
      } else {
        console.log('No returns found')
      }
      
      return returns || []
    } catch (error) {
      console.error('Error getting returns:', error)
      return []
    }
  }

  async addStore(storeData: any): Promise<Store | null> {
    try {
      // Normalize field names to match schema
      const normalizedData = {
        name: storeData.name,
        address: storeData.address || '',
        phone: storeData.phone || '',
        email: storeData.email || '',
        ownerId: storeData.ownerId || storeData.owner_id,
        subscriptionStatus: storeData.subscriptionStatus || 'trial',
        maxUsers: storeData.maxUsers || 2,
        maxProducts: storeData.maxProducts || 50,
        maxLocations: storeData.maxLocations || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data: store, error } = await supabase
        .from('stores')
        .insert([normalizedData])
        .select()
        .single();

      if (error) {
        console.error('Error inserting store:', error);
        throw error;
      }

      if (!store) return null;

      // Cache in IndexedDB
      await localDB.saveStore(store);
      return store;
    } catch (error) {
      console.error('Error adding store:', error);
      return null;
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