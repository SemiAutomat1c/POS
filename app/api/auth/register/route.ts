import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/db-adapter'
import { Database } from '@/lib/storage/supabase-types'

type Tables = Database['public']['Tables']
type UserInsert = Tables['users']['Insert']
type StoreInsert = Tables['stores']['Insert']
type SubscriptionInsert = Tables['subscriptions']['Insert']

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      username,
      email,
      password,
      storeName,
      storeAddress,
      storePhone,
      storeEmail,
      subscriptionTier
    } = body

    // Check if user already exists
    const existingUser = await db.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const existingUsername = await db.getUserByUsername(username)
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate IDs
    const userId = uuidv4()
    const storeId = uuidv4()
    const subscriptionId = uuidv4()

    // Get subscription limits based on tier
    const tierLimits = {
      free: { users: 2, products: 100, locations: 1 },
      basic: { users: 5, products: 1000, locations: 1 },
      premium: { users: 15, products: 10000, locations: 3 },
      enterprise: { users: 50, products: 100000, locations: 10 }
    }

    const limits = tierLimits[subscriptionTier as keyof typeof tierLimits]

    // Create store
    const storeData: StoreInsert = {
      id: storeId,
      name: storeName,
      address: storeAddress,
      phone: storePhone,
      email: storeEmail,
      ownerId: userId,
      subscriptionStatus: 'trial',
      maxUsers: limits.users,
      maxProducts: limits.products,
      maxLocations: limits.locations
    }

    const store = await db.addStore(storeData)
    if (!store) {
      return NextResponse.json(
        { error: 'Failed to create store' },
        { status: 500 }
      )
    }

    // Create user
    const userData: UserInsert = {
      id: userId,
      username,
      email,
      hashedPassword,
      role: 'owner',
      storeId,
      subscriptionTier,
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days trial
    }

    const user = await db.addUser(userData)
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create subscription
    const subscriptionData: SubscriptionInsert = {
      id: subscriptionId,
      userId,
      storeId,
      tier: subscriptionTier,
      status: 'trial',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
      cancelAtPeriodEnd: false
    }

    const subscription = await db.addSubscription(subscriptionData)
    if (!subscription) {
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user,
      store,
      subscription
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 