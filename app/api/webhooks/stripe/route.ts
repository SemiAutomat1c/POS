import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateUser } from '@/lib/db-adapter'
import { User } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const { userId, planId, isAnnual } = session.metadata || {}

        if (userId && planId && isValidSubscriptionTier(planId)) {
          await updateUser(userId, {
            subscriptionTier: planId,
            subscriptionStatus: 'active',
            stripeCustomerId: session.customer as string,
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const { userId } = subscription.metadata || {}

        if (userId) {
          const status = subscription.status === 'active' ? 'active' : 'inactive'
          await updateUser(userId, {
            subscriptionStatus: status as User['subscriptionStatus'],
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const { userId } = subscription.metadata || {}

        if (userId) {
          await updateUser(userId, {
            subscriptionStatus: 'cancelled',
            subscriptionTier: 'free',
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { message: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}

function isValidSubscriptionTier(
  tier: string
): tier is User['subscriptionTier'] {
  return ['free', 'basic', 'premium', 'enterprise'].includes(tier)
} 