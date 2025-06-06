export interface Feature {
  name: string
  included: boolean
  limit?: number
}

export interface Plan {
  id: 'free' | 'basic' | 'premium' | 'enterprise'
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  features: Feature[]
  limits: {
    locations: number
    users: number
    products: number
  }
  recommended?: boolean
}

export const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    description: 'Perfect for trying out our POS system',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      { name: 'Basic POS Features', included: true },
      { name: 'Basic Inventory Management', included: true },
      { name: 'Single Location', included: true },
      { name: 'Email Support', included: true },
      { name: 'Basic Reports', included: true },
      { name: 'Customer Database', included: false },
      { name: 'Advanced Analytics', included: false },
      { name: 'API Access', included: false },
    ],
    limits: {
      locations: 1,
      users: 2,
      products: 100,
    },
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'Essential features for small businesses',
    monthlyPrice: 49,
    annualPrice: 490,
    features: [
      { name: 'Basic POS Features', included: true },
      { name: 'Basic Inventory Management', included: true },
      { name: 'Single Location', included: true },
      { name: 'Email Support', included: true },
      { name: 'Basic Reports', included: true },
      { name: 'Customer Database', included: true },
      { name: 'Advanced Analytics', included: false },
      { name: 'API Access', included: false },
    ],
    limits: {
      locations: 1,
      users: 5,
      products: 1000,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Advanced features for growing businesses',
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      { name: 'Advanced POS Features', included: true },
      { name: 'Advanced Inventory Management', included: true },
      { name: 'Multiple Locations', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Advanced Reports', included: true },
      { name: 'Customer Database', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'API Access', included: false },
    ],
    limits: {
      locations: 3,
      users: 15,
      products: 10000,
    },
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Custom solutions for large businesses',
    monthlyPrice: 299,
    annualPrice: 2990,
    features: [
      { name: 'Advanced POS Features', included: true },
      { name: 'Advanced Inventory Management', included: true },
      { name: 'Unlimited Locations', included: true },
      { name: 'Dedicated Support', included: true },
      { name: 'Custom Reports', included: true },
      { name: 'Customer Database', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'API Access', included: true },
    ],
    limits: {
      locations: 10,
      users: 50,
      products: 100000,
    },
  },
]

export const features = {
  basic_pos: ['free', 'basic', 'premium', 'enterprise'],
  basic_inventory: ['free', 'basic', 'premium', 'enterprise'],
  basic_reports: ['free', 'basic', 'premium', 'enterprise'],
  basic_customers: ['basic', 'premium', 'enterprise'],
  advanced_pos: ['premium', 'enterprise'],
  advanced_inventory: ['premium', 'enterprise'],
  advanced_reports: ['premium', 'enterprise'],
  advanced_customers: ['premium', 'enterprise'],
  analytics: ['premium', 'enterprise'],
  multi_location: ['premium', 'enterprise'],
  api_access: ['enterprise'],
  custom_integrations: ['enterprise'],
}

export function getPlanById(id: string): Plan | undefined {
  return plans.find(plan => plan.id === id);
}

export function getPlanFeatures(planId: string): string[] {
  const plan = getPlanById(planId);
  return plan?.features.filter(f => f.included).map(f => f.name) || [];
}

export function comparePlans(planA: string, planB: string): -1 | 0 | 1 {
  const planOrder = ['free', 'basic', 'premium', 'enterprise'];
  const indexA = planOrder.indexOf(planA);
  const indexB = planOrder.indexOf(planB);
  
  if (indexA < indexB) return -1;
  if (indexA > indexB) return 1;
  return 0;
}

export function canUpgradePlan(currentPlan: string, targetPlan: string): boolean {
  return comparePlans(currentPlan, targetPlan) < 0;
}

export function getAnnualSavings(plan: Plan): number {
  return (plan.monthlyPrice * 12) - plan.annualPrice;
} 