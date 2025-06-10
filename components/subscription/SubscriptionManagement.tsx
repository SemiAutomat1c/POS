'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/lib/storage/supabase';

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
  const getTierName = () => {
    switch(tier) {
      case 'free': return 'Free Plan';
      case 'basic': return 'Basic Plan';
      case 'premium': return 'Premium Plan';
      case 'enterprise': return 'Enterprise Plan';
      default: return tier.charAt(0).toUpperCase() + tier.slice(1);
    }
  };
  
  // Get tier features
  const getTierFeatures = () => {
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
              <h3 className="text-lg font-medium">{getTierName()}</h3>
              <ul className="mt-2 space-y-1">
                {getTierFeatures().map((feature, index) => (
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
                  Your trial will end in {daysLeftInTrial} days. After that, you'll need to set up payment to continue using {getTierName()}.
                </p>
              </div>
            )}
            
            {status === 'trial' && !isTrialActive && tier !== 'free' && (
              <div className="bg-red-50 p-3 rounded-md border border-red-200">
                <p className="text-red-800">
                  Your trial has expired. Please set up payment to continue using {getTierName()} features.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Free Plan */}
          <Card className={tier === 'free' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>For small businesses just starting out</CardDescription>
              <div className="mt-2 text-2xl font-bold">₱0<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Up to 50 products
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Basic analytics
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Single user
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Community support
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {tier !== 'free' ? (
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => handleDowngrade('free')}
                  disabled={isLoading}
                >
                  Downgrade to Free
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Basic Plan */}
          <Card className={tier === 'basic' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <CardDescription>For growing businesses</CardDescription>
              <div className="mt-2 text-2xl font-bold">₱999<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Up to 500 products
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Enhanced analytics
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Up to 3 users
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Email support
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Inventory management
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {tier === 'basic' ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : tier === 'premium' || tier === 'enterprise' ? (
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => handleDowngrade('basic')}
                  disabled={isLoading}
                >
                  Downgrade to Basic
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('basic')}
                  disabled={isLoading}
                >
                  Upgrade to Basic
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Premium Plan */}
          <Card className={tier === 'premium' ? 'border-2 border-primary' : ''}>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>For established businesses</CardDescription>
              <div className="mt-2 text-2xl font-bold">₱1,999<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Unlimited products
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Advanced analytics
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Up to 10 users
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Priority support
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Advanced inventory
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Customer loyalty features
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {tier === 'premium' ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : tier === 'enterprise' ? (
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => handleDowngrade('premium')}
                  disabled={isLoading}
                >
                  Downgrade to Premium
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={() => handleUpgrade('premium')}
                  disabled={isLoading}
                >
                  Upgrade to Premium
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
      
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