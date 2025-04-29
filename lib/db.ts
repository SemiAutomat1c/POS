// This file handles the IndexedDB setup and operations
// For offline storage of inventory data

interface Product {
  id: number
  name: string
  category: string
  serialNumber: string
  stock: number
  price: number
  lowStockThreshold: number
  vendor: string
}

interface Customer {
  id: number
  name: string
  phone: string
  email: string
  totalPurchases: number
  totalSpent: number
  outstandingBalance: number
  lastPurchase: string
}

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

interface Sale {
  id: number
  customerId: number
  products: Array<{
    productId: number
    quantity: number
    price: number
  }>
  total: number
  date: string
  paymentId?: number
}

// Database configuration
const DB_NAME = "gadgetTrackDB"
const DB_VERSION = 1
const STORES = {
  products: "products",
  customers: "customers",
  payments: "payments",
  sales: "sales",
  settings: "settings",
}

// Initialize the database
export const initializeDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // Check if IndexedDB is supported
    if (!window.indexedDB) {
      reject("Your browser doesn't support IndexedDB. The app will not work offline.")
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = (event) => {
      reject("Database error: " + (event.target as IDBOpenDBRequest).error)
    }

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

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
    }
  })
}

// Product operations
export const getProducts = async (): Promise<Product[]> => {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.products], "readonly")
    const store = transaction.objectStore(STORES.products)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const addProduct = async (product: Omit<Product, "id">): Promise<number> => {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.products], "readwrite")
    const store = transaction.objectStore(STORES.products)
    const request = store.add(product)

    request.onsuccess = () => {
      resolve(request.result as number)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const updateProduct = async (product: Product): Promise<void> => {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.products], "readwrite")
    const store = transaction.objectStore(STORES.products)
    const request = store.put(product)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

export const deleteProduct = async (id: number): Promise<void> => {
  const db = await initializeDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.products], "readwrite")
    const store = transaction.objectStore(STORES.products)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Similar functions would be implemented for customers, payments, and sales
// This is a simplified version for the demo
