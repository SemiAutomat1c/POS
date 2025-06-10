'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLoading } from '@/components/ui/loading';
import { useAuth } from '@/providers/AuthProvider';
import { clearAllCookies } from '@/lib/utils';

// Track if we've already shown the loading screen
let globalAuthCheckStarted = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [layoutReady, setLayoutReady] = useState(globalAuthCheckStarted);
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();

  // Handle authentication on first load
  useEffect(() => {
    // Set global flag to prevent multiple loading states
    globalAuthCheckStarted = true;
    
    // Check if we're in a redirect loop prevention scenario
    const isLoopPrevention = document.cookie.includes('redirect_loop_prevention=true') || 
                             document.cookie.includes('subscription_redirect_prevention=true');
    
    if (isLoopPrevention) {
      console.log('Dashboard layout: Redirect loop prevention active, rendering content');
      setLayoutReady(true);
      // Set a longer cookie to prevent flicker on navigation within dashboard
      document.cookie = "redirect_loop_prevention=true; path=/; max-age=300";
      return;
    }
    
    // If not loading and user is null, redirect to login
    if (!authLoading && !user) {
      console.log('Dashboard layout: No authenticated user found, redirecting to login');
      setTimeout(() => {
        clearAllCookies();
        document.cookie = "redirect_loop_prevention=true; path=/; max-age=10";
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }, 100);
      return;
    }
    
    // If user is authenticated, we're ready to show the dashboard
    if (!authLoading && user) {
      console.log('Dashboard layout: User authenticated, rendering dashboard');
      setLayoutReady(true);
      document.cookie = "redirect_loop_prevention=true; path=/; max-age=300";
    }
  }, [user, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading && !layoutReady) {
    return <AuthLoading />;
  }

  // If not loading, no user, and no redirect yet, show loading until redirect happens
  if (!authLoading && !user && !layoutReady) {
    return <AuthLoading />;
  }

  // If ready, render the dashboard content
  return <div>{children}</div>;
} 