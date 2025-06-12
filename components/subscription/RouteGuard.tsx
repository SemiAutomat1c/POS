"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { hasRouteAccess, SubscriptionTier } from '@/lib/subscription';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/storage/supabase';
import FeatureRestricted from './FeatureRestricted';

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [featureInfo, setFeatureInfo] = useState({
    title: "Feature Requires Upgrade",
    message: "Unlock this feature by upgrading to our Basic, Premium, or Enterprise plans.",
    featureName: "this feature"
  });

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
        
        // If access is denied, set the appropriate feature info based on the pathname
        if (!hasAccess) {
          // Customize the feature info based on the pathname
          if (pathname?.includes('/reports')) {
            setFeatureInfo({
              title: "Reports Require a Basic Plan or Higher",
              message: "Unlock detailed reports and analytics by upgrading to our Basic, Premium, or Enterprise plans. Get valuable insights into your business performance.",
              featureName: "reports"
            });
          } else if (pathname?.includes('/returns')) {
            setFeatureInfo({
              title: "Returns Management Requires a Basic Plan",
              message: "Process and track returns efficiently by upgrading to our Basic plan or higher. Improve your customer service with better returns handling.",
              featureName: "returns management"
            });
          } else if (pathname?.includes('/payments')) {
            setFeatureInfo({
              title: "Advanced Payment Features Require a Basic Plan",
              message: "Access advanced payment processing and tracking by upgrading to our Basic plan or higher. Streamline your financial operations.",
              featureName: "advanced payments"
            });
          } else if (pathname?.includes('/scanner')) {
            setFeatureInfo({
              title: "Scanner Features Require a Basic Plan",
              message: "Use our advanced barcode scanning features by upgrading to our Basic plan or higher. Speed up inventory management and sales processes.",
              featureName: "scanner features"
            });
          } else if (pathname?.includes('/customers')) {
            setFeatureInfo({
              title: "Customer Management Requires a Basic Plan",
              message: "Manage your customer database and access customer insights by upgrading to our Basic plan or higher. Build better customer relationships.",
              featureName: "customer management"
            });
          } else {
            setFeatureInfo({
              title: "Feature Requires Upgrade",
              message: "This feature requires a higher subscription tier. Please upgrade your plan to access it.",
              featureName: "this feature"
            });
          }
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
  }, [user, pathname, toast]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show feature restricted message if not authorized
  if (!isAuthorized) {
    return <FeatureRestricted 
      title={featureInfo.title} 
      message={featureInfo.message} 
      featureName={featureInfo.featureName} 
    />;
  }

  // Render children if authorized
  return <>{children}</>;
} 