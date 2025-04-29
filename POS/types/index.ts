export type Product = {
  id: number
  name: string
  description?: string
  category: string
  serialNumber: string
  stock: number
  price: number
  costPrice?: number
  lowStockThreshold: number
  vendor: string
  barcode?: string
  images?: string[]
  specifications?: Record<string, string>
  lastRestocked?: Date
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: number
  name: string
  description?: string
  slug: string
  parentId?: number
  createdAt: Date
  updatedAt: Date
}

export type StockMovement = {
  id: number
  productId: number
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason?: string
  reference?: string
  date: Date
  userId: number
}

export type Vendor = {
  id: number
  name: string
  contact: string
  email: string
  phone: string
  address?: string
  products?: Product[]
  createdAt: Date
  updatedAt: Date
} 