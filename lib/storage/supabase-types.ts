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
    }
  }
} 