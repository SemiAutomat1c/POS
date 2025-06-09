'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { plans } from '@/lib/subscription/plans'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/storage/supabase'

export default function SubscribeForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isAnnual, setIsAnnual] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const planId = searchParams.get('plan')
    if (planId && plans.some(p => p.id === planId)) {
      setSelectedPlan(planId)
    }
  }, [searchParams])

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to subscribe')
      }

      // Get user's store
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('storeId')
        .eq('id', user.id)
        .single()

      if (userError) throw userError
      if (!userData?.storeId) throw new Error('No store found for user')

      // Get current date
      const now = new Date()
      const trialEndDate = new Date()
      trialEndDate.setDate(now.getDate() + 14) // 14-day trial

      // Update user's subscription in Supabase
      const { error: updateError } = await supabase
        .from('subscriptions')
        .upsert({
          userId: user.id,
          storeId: userData.storeId,
          tier: selectedPlan as 'free' | 'basic' | 'premium' | 'enterprise',
          status: 'trial',
          currentPeriodStart: now.toISOString(),
          currentPeriodEnd: trialEndDate.toISOString(),
          cancelAtPeriodEnd: false,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        })

      if (updateError) throw updateError

      // Update user's subscription status
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          subscriptionTier: selectedPlan,
          subscriptionStatus: 'trial',
          trialEndsAt: trialEndDate.toISOString(),
          updatedAt: now.toISOString()
        })
        .eq('id', user.id)

      if (userUpdateError) throw userUpdateError

      // Redirect to dashboard
      router.push('/dashboard?subscription=success')
    } catch (err) {
      console.error('Subscription error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Complete Your Subscription
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose your billing cycle and start your 14-day free trial
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center rounded-lg border p-1">
          <Button
            variant={isAnnual ? 'ghost' : 'default'}
            onClick={() => setIsAnnual(false)}
          >
            Monthly
          </Button>
          <Button
            variant={isAnnual ? 'default' : 'ghost'}
            onClick={() => setIsAnnual(true)}
          >
            Annual (Save 20%)
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {plans
          .filter(plan => plan.id !== 'free' && plan.id !== 'enterprise')
          .map(plan => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-colors ${
                selectedPlan === plan.id
                  ? 'border-primary'
                  : 'hover:border-primary/50'
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">
                      ₱{isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice}
                      <span className="text-sm font-normal text-muted-foreground">
                        /mo
                      </span>
                    </div>
                    {plan.recommended && (
                      <Badge variant="secondary">Recommended</Badge>
                    )}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Features</h4>
                    <ul className="grid gap-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          {feature.included ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" />
                          )}
                          {feature.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium">Limits</h4>
                    <ul className="grid gap-2 text-sm">
                      <li>Up to {plan.limits.locations} locations</li>
                      <li>Up to {plan.limits.users} users</li>
                      <li>Up to {plan.limits.products} products</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={handleSubscribe}
          disabled={!selectedPlan || isLoading}
        >
          {isLoading ? 'Processing...' : 'Start 14-Day Free Trial'}
        </Button>
      </div>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        By starting your trial, you agree to our Terms of Service and Privacy Policy.
        You can cancel your subscription at any time during the trial period.
      </p>
    </div>
  )
} 