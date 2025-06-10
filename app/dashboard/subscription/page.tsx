'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement';
import { AuthLoading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';

export default function DashboardSubscriptionPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set cookie to prevent redirect loops
    document.cookie = "redirect_loop_prevention=true; path=/; max-age=60";
    
    async function fetchData() {
      if (authLoading) return; // Wait for auth to complete
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, store:store_id(*)')
          .eq('id', user.id)
          .single();
        
        if (userError) {
          throw new Error(userError.message);
        }

        // Get subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        // Only throw error if it's not a "no rows returned" error
        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription data:', subscriptionError);
        }

        setUserData(userData);
        setSubscriptionData(subscriptionData || null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading, supabase]);

  // Show loading state while checking authentication
  if (authLoading || loading) {
    return <AuthLoading />;
  }

  // Show not authenticated state if user is not logged in
  if (!authLoading && !user) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not Authenticated</h1>
          <p className="mt-2 text-muted-foreground">Please log in to view subscription information.</p>
          <Button 
            className="mt-4" 
            onClick={() => {
              // Clear any redirect prevention cookies before redirecting
              document.cookie = "redirect_loop_prevention=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              router.push('/login?redirect=/dashboard/subscription');
            }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <h2 className="text-lg font-bold">Error</h2>
          <p>{error}</p>
          <Button 
            className="mt-4" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      {userData && (
        <SubscriptionManagement 
          user={userData} 
          subscription={subscriptionData} 
        />
      )}
    </div>
  );
} 