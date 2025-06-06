// This file handles the IndexedDB setup and operations
// For offline storage of inventory data

// Import types
import type { Return, StoreCredit } from './models/Return';
import type { Product } from './models/Product';
import type { Customer } from './models/Customer';
import type { Sale } from './models/Sale';
import type { Notification } from './models/Notification';

interface Payment {
  id: number
  customerId: number
  productId: number
  totalAmount: number
  amountPaid: number
  remainingBalance: number
  dueDate: string | null
  status: "paid" | "partial" | "overdue"
  paymentType: "full" | "installment"
  installments: Array<{
    date: string
    amount: number
    status?: "paid" | "pending" | "overdue"
  }>
}

// Database configuration
const DB_NAME = "gadgetTrackDB"
const DB_VERSION = 3 // Increased version to handle notifications
const STORES = {
  products: "products",
  customers: "customers",
  payments: "payments",
  sales: "sales",
  settings: "settings",
  returns: "returns",
  storeCredits: "storeCredits",
  notifications: "notifications"
}

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Singleton instance and initialization promise
let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

// Initialize the database
export const initializeDB = (): Promise<IDBDatabase> => {
  // If we're on the server, return a mock promise
  if (!isBrowser) {
    console.warn('Attempted to initialize IndexedDB on the server. This operation will be deferred to the client.');
    return Promise.reject(new Error('IndexedDB is not available on the server'));
  }
  
  // Return cached instance if available
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  // Return existing initialization promise if it exists
  if (dbInitPromise) {
    return dbInitPromise;
  }

  // Create new initialization promise
  dbInitPromise = new Promise((resolve, reject) => {
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
      reject(new Error("Your browser doesn't support IndexedDB. The app will not work offline."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      console.error("Database error:", error);
      dbInitPromise = null; // Clear the promise so we can try again
      reject(new Error("Database error: " + error?.message || "Unknown error"));
    }

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      console.log("Database initialized successfully");

      // Handle connection loss
      dbInstance.onclose = () => {
        console.log("Database connection closed");
        dbInstance = null;
        dbInitPromise = null;
      };

      dbInstance.onerror = (event: Event) => {
        const target = event.target as IDBRequest;
        console.error("Database error:", target.error);
        dbInstance = null;
        dbInitPromise = null;
      };

      resolve(dbInstance);
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.products)) {
        const productStore = db.createObjectStore(STORES.products, { keyPath: "id", autoIncrement: true })
        productStore.createIndex("name", "name", { unique: false })
        productStore.createIndex("category", "category", { unique: false })
        productStore.createIndex("serialNumber", "serialNumber", { unique: true })
        productStore.createIndex("stock", "stock", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.customers)) {
        const customerStore = db.createObjectStore(STORES.customers, { keyPath: "id", autoIncrement: true })
        customerStore.createIndex("name", "name", { unique: false })
        customerStore.createIndex("phone", "phone", { unique: true })
        customerStore.createIndex("email", "email", { unique: true })
      }

      if (!db.objectStoreNames.contains(STORES.payments)) {
        const paymentStore = db.createObjectStore(STORES.payments, { keyPath: "id", autoIncrement: true })
        paymentStore.createIndex("customerId", "customerId", { unique: false })
        paymentStore.createIndex("status", "status", { unique: false })
        paymentStore.createIndex("dueDate", "dueDate", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.sales)) {
        const saleStore = db.createObjectStore(STORES.sales, { keyPath: "id", autoIncrement: true })
        saleStore.createIndex("customerId", "customerId", { unique: false })
        saleStore.createIndex("date", "date", { unique: false })
      }

      if (!db.objectStoreNames.contains(STORES.settings)) {
        db.createObjectStore(STORES.settings, { keyPath: "id" })
      }
      
      // New stores for returns processing system
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(STORES.returns)) {
          const returnsStore = db.createObjectStore(STORES.returns, { keyPath: "id", autoIncrement: true })
          returnsStore.createIndex("originalSaleId", "originalSaleId", { unique: false })
          returnsStore.createIndex("customerId", "customerId", { unique: false })
          returnsStore.createIndex("returnDate", "returnDate", { unique: false })
          returnsStore.createIndex("status", "status", { unique: false })
          returnsStore.createIndex("returnType", "returnType", { unique: false })
        }
        
        if (!db.objectStoreNames.contains(STORES.storeCredits)) {
          const storeCreditsStore = db.createObjectStore(STORES.storeCredits, { keyPath: "id", autoIncrement: true })
          storeCreditsStore.createIndex("customerId", "customerId", { unique: false })
          storeCreditsStore.createIndex("referenceCode", "referenceCode", { unique: true })
          storeCreditsStore.createIndex("status", "status", { unique: false })
        }
      }
      
      // Add notifications store in version 3
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(STORES.notifications)) {
          const notificationsStore = db.createObjectStore(STORES.notifications, { keyPath: "id", autoIncrement: true })
          notificationsStore.createIndex("type", "type", { unique: false })
          notificationsStore.createIndex("isRead", "isRead", { unique: false })
          notificationsStore.createIndex("priority", "priority", { unique: false })
          notificationsStore.createIndex("createdAt", "createdAt", { unique: false })
          notificationsStore.createIndex("relatedItemId", "relatedItemId", { unique: false })
          notificationsStore.createIndex("type_relatedItemId", ["type", "relatedItemId"], { unique: false })
        }
      }
    }
  });

  return dbInitPromise;
}

// Helper function to ensure database connection
const ensureConnection = async (): Promise<IDBDatabase> => {
  try {
    return await initializeDB();
  } catch (error) {
    // Clear instance and promise if there's an error
    dbInstance = null;
    dbInitPromise = null;
    throw error;
  }
}

// General database helper functions
export const getAll = async <T>(storeName: string): Promise<T[]> => {
  const db = await ensureConnection();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export const get = async <T>(storeName: string, id: number): Promise<T | undefined> => {
  const db = await ensureConnection()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly")
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const getAllFromIndex = async <T>(storeName: string, indexName: string, indexValue: any): Promise<T[]> => {
  const db = await ensureConnection()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readonly")
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    let request;
    
    // Check if indexValue is a valid key type for IDBKeyRange
    // Valid types are: string, number, Date, ArrayBuffer, or array of these types
    const isValidKeyType = indexValue !== undefined && indexValue !== null && 
      (typeof indexValue === 'string' || 
       typeof indexValue === 'number' || 
       indexValue instanceof Date || 
       indexValue instanceof ArrayBuffer ||
       Array.isArray(indexValue));
    
    if (!isValidKeyType) {
      // If not a valid key type, get all records
      request = index.getAll();
    } else {
      // Otherwise use the key
      request = index.getAll(indexValue);
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const add = async <T>(storeName: string, data: T): Promise<number> => {
  const db = await ensureConnection()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.add(data)

    request.onsuccess = () => {
      resolve(request.result as number)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const put = async <T>(storeName: string, data: T): Promise<void> => {
  const db = await ensureConnection()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.put(data)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const delete_ = async (storeName: string, id: number): Promise<void> => {
  const db = await ensureConnection()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], "readwrite")
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  return getAll<Product>(STORES.products);
}

export const getProductById = async (id: number): Promise<Product | undefined> => {
  return get<Product>(STORES.products, id);
}

export const addProduct = async (product: Omit<Product, "id">): Promise<number> => {
  return add<Omit<Product, "id">>(STORES.products, product);
}

export const updateProduct = async (product: Product): Promise<void> => {
  return put<Product>(STORES.products, product);
}

export const deleteProduct = async (id: number): Promise<void> => {
  return delete_(STORES.products, id);
}

// Similar functions would be implemented for customers, payments, and sales
// This is a simplified version for the demo
