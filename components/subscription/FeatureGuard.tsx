"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { hasFeatureAccess, hasRouteAccess, SubscriptionTier } from '@/lib/subscription';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/storage/supabase';

interface FeatureGuardProps {
  feature?: string; // The feature to check access for
  children: React.ReactNode;
  fallback?: React.ReactNode; // Optional fallback UI to show when access is denied
}

export default function FeatureGuard({
  feature,
  children,
  fallback
}: FeatureGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState<{
    subscription_tier: SubscriptionTier
  } | null>(null);

  useEffect(() => {
    // If user isn't loaded yet or no user is logged in, wait or redirect
    if (!user) {
      setIsLoading(true);
      return;
    }

    // Fetch the user's subscription tier from Supabase
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserSubscription(data);
        
        // Get the user's subscription tier
        const tier = (data?.subscription_tier || 'free') as SubscriptionTier;
        let accessGranted = true;

        // If a specific feature is provided, check access for that feature
        if (feature) {
          accessGranted = hasFeatureAccess(tier, feature);
        } 
        // Otherwise, check access for the current route
        else if (pathname) {
          accessGranted = hasRouteAccess(tier, pathname);
        }

        setHasAccess(accessGranted);
        setIsLoading(false);

        // If access is denied, show a toast and redirect to subscription page
        if (!accessGranted && !fallback) {
          toast({
            title: "Feature not available",
            description: "Please upgrade your subscription to access this feature.",
            variant: "destructive"
          });
          
          router.push('/dashboard/subscription');
        }
      } catch (error) {
        console.error('Error fetching user subscription:', error);
        setIsLoading(false);
        // Default to no access on error
        setHasAccess(false);
      }
    };

    fetchUserData();
  }, [user, feature, pathname, router, toast, fallback]);

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  // Show fallback if provided and access is denied
  if (!hasAccess && fallback) {
    return <>{fallback}</>;
  }

  // Show children if access is granted
  if (hasAccess) {
    return <>{children}</>;
  }

  // By default, return null if access is denied (the redirect will happen)
  return null;
} 