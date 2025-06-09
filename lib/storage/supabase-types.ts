export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise'
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'cancelled'
export type UserRole = 'owner' | 'admin' | 'staff'
export type ProductCondition = 'new' | 'pre-owned' | 'refurbished'
export type PaymentMethod = 'cash' | 'card' | 'transfer'
export type SaleStatus = 'completed' | 'pending' | 'cancelled'
export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'completed'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          hashedPassword: string
          role: UserRole
          storeId: string
          subscriptionTier: SubscriptionTier
          subscriptionStatus: SubscriptionStatus
          stripeCustomerId: string | null
          trialEndsAt: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          hashedPassword: string
          role: UserRole
          storeId: string
          subscriptionTier: SubscriptionTier
          subscriptionStatus: SubscriptionStatus
          stripeCustomerId?: string | null
          trialEndsAt?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          hashedPassword?: string
          role?: UserRole
          storeId?: string
          subscriptionTier?: SubscriptionTier
          subscriptionStatus?: SubscriptionStatus
          stripeCustomerId?: string | null
          trialEndsAt?: string | null
          updatedAt?: string
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          email: string
          ownerId: string
          subscriptionStatus: SubscriptionStatus
          maxUsers: number
          maxProducts: number
          maxLocations: number
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          email: string
          ownerId: string
          subscriptionStatus: SubscriptionStatus
          maxUsers: number
          maxProducts: number
          maxLocations: number
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          ownerId?: string
          subscriptionStatus?: SubscriptionStatus
          maxUsers?: number
          maxProducts?: number
          maxLocations?: number
          updatedAt?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          userId: string
          storeId: string
          tier: SubscriptionTier
          status: SubscriptionStatus
          stripeSubscriptionId: string | null
          currentPeriodStart: string
          currentPeriodEnd: string
          cancelAtPeriodEnd: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          userId: string
          storeId: string
          tier: SubscriptionTier
          status: SubscriptionStatus
          stripeSubscriptionId?: string | null
          currentPeriodStart: string
          currentPeriodEnd: string
          cancelAtPeriodEnd?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          userId?: string
          storeId?: string
          tier?: SubscriptionTier
          status?: SubscriptionStatus
          stripeSubscriptionId?: string | null
          currentPeriodStart?: string
          currentPeriodEnd?: string
          cancelAtPeriodEnd?: boolean
          updatedAt?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          sku: string | null
          serialNumber: string | null
          quantity: number
          price: number
          cost: number
          minStockLevel: number
          categoryId: string | null
          brand: string | null
          model: string | null
          color: string | null
          storage: string | null
          condition: ProductCondition
          storeId: string
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          sku?: string | null
          serialNumber?: string | null
          quantity: number
          price: number
          cost: number
          minStockLevel?: number
          categoryId?: string | null
          brand?: string | null
          model?: string | null
          color?: string | null
          storage?: string | null
          condition: ProductCondition
          storeId: string
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          name?: string
          description?: string | null
          sku?: string | null
          serialNumber?: string | null
          quantity?: number
          price?: number
          cost?: number
          minStockLevel?: number
          categoryId?: string | null
          brand?: string | null
          model?: string | null
          color?: string | null
          storage?: string | null
          condition?: ProductCondition
          storeId?: string
          updatedAt?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          storeId: string
          totalPurchases: number
          lastPurchaseDate: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          storeId: string
          totalPurchases?: number
          lastPurchaseDate?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          storeId?: string
          totalPurchases?: number
          lastPurchaseDate?: string | null
          updatedAt?: string
        }
      }
      sales: {
        Row: {
          id: string
          customerId: string | null
          storeId: string
          userId: string
          total: number
          subtotal: number
          tax: number
          discount: number
          paymentMethod: PaymentMethod
          status: SaleStatus
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          customerId?: string | null
          storeId: string
          userId: string
          total: number
          subtotal: number
          tax: number
          discount?: number
          paymentMethod: PaymentMethod
          status: SaleStatus
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          customerId?: string | null
          storeId?: string
          userId?: string
          total?: number
          subtotal?: number
          tax?: number
          discount?: number
          paymentMethod?: PaymentMethod
          status?: SaleStatus
          notes?: string | null
          updatedAt?: string
        }
      }
      returns: {
        Row: {
          id: string
          saleId: string
          customerId: string | null
          storeId: string
          userId: string
          total: number
          reason: string
          status: ReturnStatus
          notes: string | null
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          saleId: string
          customerId?: string | null
          storeId: string
          userId: string
          total: number
          reason: string
          status: ReturnStatus
          notes?: string | null
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          saleId?: string
          customerId?: string | null
          storeId?: string
          userId?: string
          total?: number
          reason?: string
          status?: ReturnStatus
          notes?: string | null
          updatedAt?: string
        }
      }
    }
  }
} 