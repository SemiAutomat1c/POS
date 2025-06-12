'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/storage/supabase';
import { getTierName, getTierFeatures, SubscriptionTier } from '@/lib/subscription';

interface SubscriptionManagementProps {
  user: any;
  subscription: any | null;
}

export default function SubscriptionManagement({ user, subscription }: SubscriptionManagementProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const tier = user.subscription_tier || 'free';
  const status = user.subscription_status || 'active';
  const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
  
  const isTrialActive = status === 'trial' && trialEndsAt && new Date() < trialEndsAt;
  const daysLeftInTrial = trialEndsAt 
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  
  // Determine subscription status display
  const getStatusDisplay = () => {
    if (tier === 'free') return 'Free';
    if (status === 'trial') {
      if (isTrialActive) return `Trial (${daysLeftInTrial} days left)`;
      return 'Trial Expired';
    }
    if (status === 'active') return 'Active';
    if (status === 'canceled') return 'Canceled';
    if (status === 'past_due') return 'Past Due';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  // Get tier display name
  const displayTierName = () => {
    return getTierName(tier as SubscriptionTier);
  };
  
  // Get tier features
  const displayTierFeatures = () => {
    return getTierFeatures(tier as SubscriptionTier);
  };
  
  // Function to handle plan upgrade
  const handleUpgrade = async (newTier: string) => {
    setIsLoading(true);
    try {
      // Update user record
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          subscription_tier: newTier,
          subscription_status: isTrialActive ? 'trial' : 'active'
        })
        .eq('id', user.id);
        
      if (userUpdateError) throw userUpdateError;
      
      // Update or create subscription record
      const subscriptionData = {
        user_id: user.id,
        store_id: user.store_id,
        tier: newTier,
        status: isTrialActive ? 'trial' : 'active',
        current_period_start: new Date(),
        current_period_end: isTrialActive ? trialEndsAt : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancel_at_period_end: false
      };
      
      if (subscription) {
        const { error: subscriptionUpdateError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', subscription.id);
          
        if (subscriptionUpdateError) throw subscriptionUpdateError;
      } else {
        const { error: subscriptionInsertError } = await supabase
          .from('subscriptions')
          .insert([subscriptionData]);
          
        if (subscriptionInsertError) throw subscriptionInsertError;
      }
      
      toast.success(`Successfully upgraded to ${newTier} plan`);
      router.refresh();
    } catch (error: any) {
      console.error('Error upgrading plan:', error);
      toast.error(`Failed to upgrade plan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle plan downgrade
  const handleDowngrade = async (newTier: string) => {
    setIsLoading(true);
    try {
      // Update user record
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          subscription_tier: newTier,
          subscription_status: isTrialActive ? 'trial' : 'active'
        })
        .eq('id', user.id);
        
      if (userUpdateError) throw userUpdateError;
      
      // Update or create subscription record
      const subscriptionData = {
        user_id: user.id,
        store_id: user.store_id,
        tier: newTier,
        status: isTrialActive ? 'trial' : 'active',
        current_period_start: new Date(),
        current_period_end: isTrialActive ? trialEndsAt : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancel_at_period_end: false
      };
      
      if (subscription) {
        const { error: subscriptionUpdateError } = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('id', subscription.id);
          
        if (subscriptionUpdateError) throw subscriptionUpdateError;
      } else {
        const { error: subscriptionInsertError } = await supabase
          .from('subscriptions')
          .insert([subscriptionData]);
          
        if (subscriptionInsertError) throw subscriptionInsertError;
      }
      
      toast.success(`Successfully changed to ${newTier} plan`);
      router.refresh();
    } catch (error: any) {
      console.error('Error changing plan:', error);
      toast.error(`Failed to change plan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your current subscription details</CardDescription>
            </div>
            <Badge variant={tier === 'free' ? 'outline' : 'default'}>
              {getStatusDisplay()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{displayTierName()}</h3>
              <ul className="mt-2 space-y-1">
                {displayTierFeatures().map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mr-2 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            {isTrialActive && tier !== 'free' && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <p className="text-amber-800">
                  Your trial will end in {daysLeftInTrial} days. After that, you'll need to set up payment to continue using {displayTierName()}.
                </p>
              </div>
            )}
            
            {status === 'trial' && !isTrialActive && tier !== 'free' && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <p className="text-red-800">
                  Your trial has expired. Please set up payment to continue using {displayTierName()} features.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Available Plans */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that works for your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-1.5">
                  <CardTitle>Free</CardTitle>
                  <CardDescription>For small businesses just starting out</CardDescription>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">₱0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {displayTierFeatures().map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  disabled={tier === 'free'}
                >
                  {tier === 'free' ? 'Current Plan' : 'Downgrade to Free'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Basic Plan */}
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-1.5">
                  <CardTitle>Basic</CardTitle>
                  <CardDescription>For growing businesses</CardDescription>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">₱249</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getTierFeatures('basic').map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={tier === 'basic' ? 'outline' : 'default'} 
                  className="w-full"
                  onClick={() => tier === 'basic' 
                    ? handleDowngrade('free') 
                    : (tier === 'free' ? handleUpgrade('basic') : handleDowngrade('basic'))}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 
                    tier === 'basic' ? 'Current Plan' : 
                    tier === 'free' ? 'Upgrade to Basic' : 'Downgrade to Basic'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Premium Plan */}
            <Card>
              <CardHeader>
                <div className="flex flex-col space-y-1.5">
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>For established businesses</CardDescription>
                </div>
                <div className="mt-2">
                  <span className="text-3xl font-bold">₱499</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {getTierFeatures('premium').map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="mr-2 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  variant={tier === 'premium' ? 'outline' : 'default'}
                  className="w-full"
                  onClick={() => tier === 'premium' 
                    ? handleDowngrade('basic') 
                    : handleUpgrade('premium')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 
                    tier === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment Section - Placeholder for future GCash integration */}
      {tier !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Manage your payment methods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md text-center">
              <p>GCash payment integration coming soon!</p>
              <p className="text-sm text-muted-foreground mt-2">
                For now, please contact support to set up manual payments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 