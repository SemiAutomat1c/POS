// Subscription tier definitions and access control

// Define the various subscription tiers
export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

// Define feature access by subscription tier
export interface TierLimitations {
  maxProducts: number;
  maxUsers: number;
  maxCustomers: number;
  features: Record<string, boolean>;
}

// Define the limitations for each subscription tier
export const TIER_LIMITATIONS: Record<SubscriptionTier, TierLimitations> = {
  free: {
    maxProducts: 50,
    maxUsers: 1,
    maxCustomers: 50,
    features: {
      basicAnalytics: true,
      enhancedAnalytics: false,
      advancedAnalytics: false,
      basicSales: true,
      fullSales: false,
      basicCustomers: false,
      fullCustomers: false,
      reports: false,
      returns: false,
      basicScanner: false,
      fullScanner: false,
      inventoryManagement: true,
      customerLoyalty: false,
      apiAccess: false,
      multiStore: false,
      dataExport: false,
    }
  },
  basic: {
    maxProducts: 500,
    maxUsers: 3,
    maxCustomers: 500,
    features: {
      basicAnalytics: true,
      enhancedAnalytics: true,
      advancedAnalytics: false,
      basicSales: true,
      fullSales: true,
      basicCustomers: true,
      fullCustomers: true,
      reports: true,
      returns: true,
      basicScanner: true,
      fullScanner: true,
      inventoryManagement: true,
      customerLoyalty: false,
      apiAccess: false,
      multiStore: false,
      dataExport: false,
    }
  },
  premium: {
    maxProducts: Infinity,
    maxUsers: 10,
    maxCustomers: Infinity,
    features: {
      basicAnalytics: true,
      enhancedAnalytics: true,
      advancedAnalytics: true,
      basicSales: true,
      fullSales: true,
      basicCustomers: true,
      fullCustomers: true,
      reports: true,
      returns: true,
      basicScanner: true,
      fullScanner: true,
      inventoryManagement: true,
      customerLoyalty: true,
      apiAccess: false,
      multiStore: false,
      dataExport: true,
    }
  },
  enterprise: {
    maxProducts: Infinity,
    maxUsers: Infinity,
    maxCustomers: Infinity,
    features: {
      basicAnalytics: true,
      enhancedAnalytics: true,
      advancedAnalytics: true,
      basicSales: true,
      fullSales: true,
      basicCustomers: true,
      fullCustomers: true,
      reports: true,
      returns: true,
      basicScanner: true,
      fullScanner: true,
      inventoryManagement: true,
      customerLoyalty: true,
      apiAccess: true,
      multiStore: true,
      dataExport: true,
    }
  }
};

// Route access permissions by feature
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': ['basicAnalytics'],
  '/dashboard/inventory': ['inventoryManagement'],
  '/dashboard/customers': ['basicCustomers'],
  '/dashboard/sales': ['basicSales'],
  '/dashboard/returns': ['returns'],
  '/dashboard/payments': ['fullSales'],
  '/dashboard/reports': ['reports'],
  '/dashboard/scanner': ['basicScanner'],
  '/dashboard/settings': [], // Everyone has access to settings
  '/dashboard/profile': [], // Everyone has access to profile
  '/dashboard/subscription': [], // Everyone has access to subscription
};

// Helper function to check if a user's tier has access to a specific feature
export function hasFeatureAccess(tier: SubscriptionTier, feature: string): boolean {
  if (!TIER_LIMITATIONS[tier]) {
    return false;
  }
  return TIER_LIMITATIONS[tier].features[feature] || false;
}

// Helper function to check if a user's tier has access to a specific route
export function hasRouteAccess(tier: SubscriptionTier, route: string): boolean {
  if (!ROUTE_PERMISSIONS[route]) {
    return false; // Unknown route, deny access by default
  }
  
  // If the route has no required features, allow access
  if (ROUTE_PERMISSIONS[route].length === 0) {
    return true;
  }
  
  // Check if the tier has access to at least one of the required features
  return ROUTE_PERMISSIONS[route].some(feature => hasFeatureAccess(tier, feature));
}

// Helper function to check if a user has reached their product limit
export function hasReachedProductLimit(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount >= TIER_LIMITATIONS[tier].maxProducts;
}

// Helper function to check if a user has reached their user limit
export function hasReachedUserLimit(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount >= TIER_LIMITATIONS[tier].maxUsers;
}

// Helper function to check if a user has reached their customer limit
export function hasReachedCustomerLimit(tier: SubscriptionTier, currentCount: number): boolean {
  return currentCount >= TIER_LIMITATIONS[tier].maxCustomers;
}

// Helper function to get the tier name for display
export function getTierName(tier: SubscriptionTier): string {
  switch(tier) {
    case 'free': return 'Free Plan';
    case 'basic': return 'Basic Plan';
    case 'premium': return 'Premium Plan';
    case 'enterprise': return 'Enterprise Plan';
    default: return (tier as string).charAt(0).toUpperCase() + (tier as string).slice(1);
  }
}

// Helper function to get feature details for a tier
export function getTierFeatures(tier: SubscriptionTier): string[] {
  switch(tier) {
    case 'free':
      return [
        'Up to 50 products',
        'Basic analytics',
        'Single user',
        'Community support'
      ];
    case 'basic':
      return [
        'Up to 500 products',
        'Enhanced analytics',
        'Up to 3 users',
        'Email support',
        'Inventory management'
      ];
    case 'premium':
      return [
        'Unlimited products',
        'Advanced analytics',
        'Up to 10 users',
        'Priority support',
        'Advanced inventory management',
        'Customer loyalty features'
      ];
    case 'enterprise':
      return [
        'Unlimited everything',
        'Custom analytics',
        'Unlimited users',
        'Dedicated support',
        'Custom features',
        'API access'
      ];
    default:
      return ['Basic features'];
  }
} 