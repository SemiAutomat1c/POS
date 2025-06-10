'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement';
import { AuthLoading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { clearAllCookies } from '@/lib/utils';
import { supabase } from '@/lib/storage/supabase';

export default function DashboardSubscriptionPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, error: authError } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Set cookie to prevent potential redirect loops
  useEffect(() => {
    // Ensure cookie exists with long expiry
    document.cookie = "redirect_loop_prevention=true; path=/; max-age=300";
  }, []);

  // Fetch user and subscription data when auth is ready
  useEffect(() => {
    async function fetchData() {
      if (authLoading || !user) {
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
  }, [user, authLoading]);

  // Show loading state while fetching data
  if (loading) {
    return <AuthLoading />;
  }

  // Show error message if something went wrong
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

  // Render subscription management component with user data
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