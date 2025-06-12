"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { hasRouteAccess, SubscriptionTier } from '@/lib/subscription';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/storage/supabase';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip authorization check for non-dashboard routes, login, and subscription pages
    const isPublicRoute = !pathname?.startsWith('/dashboard') || 
                          pathname === '/dashboard/subscription' ||
                          pathname === '/dashboard/profile' ||
                          pathname === '/dashboard/settings';
    
    if (isPublicRoute) {
      setIsAuthorized(true);
      setIsLoading(false);
      return;
    }

    // If user isn't loaded yet, keep loading
    if (!user) {
      setIsLoading(true);
      return;
    }

    const checkAccess = async () => {
      try {
        // Fetch the user's subscription tier from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('subscription_tier')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        // Get the user's subscription tier
        const tier = (data?.subscription_tier || 'free') as SubscriptionTier;
        
        // Check if the user has access to the current route
        const hasAccess = hasRouteAccess(tier, pathname || '');
        
        setIsAuthorized(hasAccess);
        
        // If access is denied, show a toast and redirect to subscription page
        if (!hasAccess) {
          toast({
            title: "Access Denied",
            description: "Your current subscription does not allow access to this feature. Please upgrade to continue.",
            variant: "destructive"
          });
          
          router.push('/dashboard/subscription');
        }
      } catch (error) {
        console.error('Error checking route access:', error);
        // Default to no access on error
        setIsAuthorized(false);
        toast({
          title: "Access Error",
          description: "There was an error checking your subscription. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user, pathname, router, toast]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Render children if authorized
  return isAuthorized ? <>{children}</> : null;
} 