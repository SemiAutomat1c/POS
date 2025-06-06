export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'blocked';
  totalOrders: number;
  lastPurchase?: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  serialNumber: string;
  quantity: number;
  price: number;
  cost: number;
  minStockLevel: number;
  brand?: string;
  color?: string;
  storage?: string;
  condition?: 'new' | 'pre-owned' | 'refurbished';
  createdAt: Date;
  updatedAt: Date;
}

export interface UIProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  serialNumber: string;
  stock: number;
  price: number;
  costPrice: number;
  lowStockThreshold: number;
  vendor: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  color?: string;
  storage?: string;
  condition?: 'new' | 'pre-owned' | 'refurbished';
  createdAt: Date;
  updatedAt: Date;
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

export interface User {
  id: string
  username: string
  email: string
  hashedPassword: string
  role: 'owner' | 'admin' | 'staff'
  storeId: string
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise'
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Store {
  id: string
  name: string
  address: string
  phone: string
  email: string
  ownerId: string
  subscriptionStatus: 'active' | 'inactive' | 'trial'
  maxUsers: number
  maxProducts: number
  maxLocations: number
  createdAt: Date
  updatedAt: Date
} 