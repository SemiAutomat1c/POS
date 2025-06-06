export interface User {
  id: string;
  username: string;
  email: string;
  hashedPassword: string;
  role: 'owner' | 'manager' | 'staff';
  storeId?: string;
  subscriptionTier: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'trial' | 'expired';
  trialEndsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  type: 'retail' | 'electronics' | 'fashion' | 'other';
  size: 'small' | 'medium' | 'large';
  locations: number;
  maxUsers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  storeId: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'trial' | 'expired';
  startDate: Date;
  endDate: Date;
  trialEndsAt?: Date;
  features: string[];
  maxLocations: number;
  maxUsers: number;
  maxProducts: number;
  price: number;
  billingCycle: 'monthly' | 'annual';
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthError {
  code: 
    | 'invalid_credentials'
    | 'user_not_found'
    | 'email_exists'
    | 'username_exists'
    | 'weak_password'
    | 'invalid_email'
    | 'invalid_username'
    | 'subscription_required'
    | 'subscription_expired'
    | 'trial_expired';
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  storeName: string;
  storeType: Store['type'];
  storeSize: Store['size'];
} 