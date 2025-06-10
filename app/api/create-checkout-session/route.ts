import { NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth/utils'

const subscriptionSchema = z.object({
  planId: z.enum(['basic', 'premium', 'enterprise']),
  isAnnual: z.boolean(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = subscriptionSchema.parse(body)

    // Get user from session - using await with cookies()
    const cookiesStore = await cookies()
    const sessionToken = cookiesStore.get('session_token')?.value
    if (!sessionToken) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getUserFromSession(sessionToken)
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Instead of creating a Stripe checkout session, just return success
    // In a real application, you would handle subscription creation here
    return NextResponse.json({ 
      success: true,
      message: 'Subscription request processed',
      plan: validatedData.planId,
      isAnnual: validatedData.isAnnual
    })
  } catch (error) {
    console.error('Subscription error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to process subscription request' },
      { status: 500 }
    )
  }
} 