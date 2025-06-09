'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/storage/supabase';
import { useRouter } from 'next/navigation';
import { AuthLoading } from '@/components/ui/loading';

// Create a global state to track if we've already shown the loading screen
let globalAuthCheckStarted = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>(
    globalAuthCheckStarted ? 'authenticated' : 'loading'
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  // Check authentication status on component mount
  useEffect(() => {
    // Set global flag to prevent multiple loading states
    globalAuthCheckStarted = true;
    
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;
    
    // Check if we're in a redirect loop prevention scenario
    const isLoopPrevention = document.cookie.includes('redirect_loop_prevention=true');
    
    if (isLoopPrevention) {
      console.log('Dashboard layout: Redirect loop prevention active, rendering content');
      setAuthState('authenticated');
      // Set a longer cookie to prevent flicker on navigation within dashboard
      document.cookie = "redirect_loop_prevention=true; path=/; max-age=60";
      return;
    }
    
    const checkAuth = async () => {
      try {
        console.log('Dashboard layout: Checking authentication...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Dashboard layout: Error checking auth status:', error);
          setAuthError(error.message);
          if (isMounted) setAuthState('unauthenticated');
          return;
        }
        
        if (!data.session) {
          console.log('Dashboard layout: No active session');
          if (isMounted) setAuthState('unauthenticated');
          return;
        }
        
        console.log('Dashboard layout: User is authenticated:', data.session.user.id);
        if (isMounted) setAuthState('authenticated');
        
        // Set a cookie to prevent flicker on navigation within dashboard
        document.cookie = "redirect_loop_prevention=true; path=/; max-age=60";
        
        // Set up auth state listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event);
            if (event === 'SIGNED_OUT') {
              setAuthState('unauthenticated');
            }
          }
        );
        
        unsubscribe = authListener.subscription.unsubscribe;
      } catch (err) {
        console.error('Dashboard layout: Unexpected error during auth check:', err);
        setAuthError(err instanceof Error ? err.message : 'Unknown error occurred');
        if (isMounted) setAuthState('unauthenticated');
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (authState === 'loading') {
    return <AuthLoading />;
  }

  if (authState === 'unauthenticated') {
    // Set a cookie to prevent redirect loops and then redirect
    document.cookie = "redirect_loop_prevention=true; path=/; max-age=10";
    
    // Use a small timeout to ensure the cookie is set before redirecting
    setTimeout(() => {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }, 100);
    
    // Show loading state instead of auth error
    return <AuthLoading />;
  }

  return (
    <div>
      {children}
    </div>
  );
} 