import { NextResponse } from 'next/server'
import { z } from 'zod'
import Stripe from 'stripe'
import { plans } from '@/lib/subscription/plans'
import { cookies } from 'next/headers'
import { getUserFromSession } from '@/lib/auth/utils'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const checkoutSchema = z.object({
  planId: z.enum(['basic', 'premium', 'enterprise']),
  isAnnual: z.boolean(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    // Get user from session
    const sessionToken = cookies().get('session_token')?.value
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

    // Get plan details
    const plan = plans.find(p => p.id === validatedData.planId)
    if (!plan) {
      return NextResponse.json(
        { message: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // Create Stripe customer if not exists
    let stripeCustomerId = user.stripeCustomerId
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })
      stripeCustomerId = customer.id
      // Update user with Stripe customer ID
      // This should be done in your database
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'required',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan.name,
              description: plan.description,
            },
            unit_amount: validatedData.isAnnual
              ? Math.round((plan.annualPrice / 12) * 100)
              : plan.monthlyPrice * 100,
            recurring: {
              interval: validatedData.isAnnual ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: validatedData.planId,
        isAnnual: validatedData.isAnnual.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscribe?plan=${validatedData.planId}`,
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Checkout session error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
} 