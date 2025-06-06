import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { User } from '@/types'
import { getUserById } from '@/lib/db-adapter'

// Validation schemas
export const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be less than 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(100, 'Email must be less than 100 characters')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  )

// Error messages
const AUTH_ERRORS = {
  invalid_credentials: 'Invalid email or password',
  email_exists: 'An account with this email already exists',
  username_exists: 'This username is already taken',
  user_not_found: 'User not found',
  invalid_token: 'Invalid or expired token',
  subscription_required: 'A valid subscription is required to access this feature',
  subscription_limit_reached: 'Subscription limit reached',
} as const

export type AuthError = keyof typeof AUTH_ERRORS

export function createAuthError(error: AuthError) {
  return {
    error,
    message: AUTH_ERRORS[error],
  }
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Session management
export function generateSessionToken(): string {
  return uuidv4()
}

export async function getUserFromSession(sessionToken: string): Promise<User | null> {
  try {
    // In a real application, you would:
    // 1. Verify the session token from your sessions table
    // 2. Get the userId associated with the session
    // 3. Get the user data from your database
    
    // For now, we'll just get the user directly (you should implement proper session handling)
    const userId = sessionToken // This should be replaced with proper session lookup
    return getUserById(userId)
  } catch (error) {
    console.error('Error getting user from session:', error)
    return null
  }
}

// Subscription helpers
export function isSubscriptionValid(
  status: string,
  trialEndsAt: Date
): boolean {
  if (status === 'active') return true
  if (status === 'trial' && trialEndsAt > new Date()) return true
  return false
}

export function hasFeatureAccess(
  tier: string,
  feature: string
): boolean {
  const tierFeatures = {
    free: ['basic_pos', 'basic_inventory'],
    basic: ['basic_pos', 'basic_inventory', 'basic_reports', 'basic_customers'],
    premium: [
      'advanced_pos',
      'advanced_inventory',
      'advanced_reports',
      'advanced_customers',
      'analytics',
      'multi_location',
    ],
    enterprise: [
      'advanced_pos',
      'advanced_inventory',
      'advanced_reports',
      'advanced_customers',
      'analytics',
      'multi_location',
      'api_access',
      'custom_integrations',
    ],
  }

  return tierFeatures[tier as keyof typeof tierFeatures]?.includes(feature) ?? false
}

// Validation helpers
export function validateUsername(username: string): string | null {
  const result = usernameSchema.safeParse(username)
  return result.success ? null : result.error.errors[0].message
}

export function validateEmail(email: string): string | null {
  const result = emailSchema.safeParse(email)
  return result.success ? null : result.error.errors[0].message
}

export function validatePassword(password: string): string | null {
  const result = passwordSchema.safeParse(password)
  return result.success ? null : result.error.errors[0].message
} 