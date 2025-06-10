import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement';

export const dynamic = 'force-dynamic';

export default async function SubscriptionPage() {
  const cookieStore = await cookies();
  
  // Create Supabase client using the newer SSR package
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          // This is handled by the server, so we don't need to implement it
        },
        remove(name, options) {
          // This is handled by the server, so we don't need to implement it
        },
      },
    }
  );
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/login');
  }
  
  // Get user data including subscription information
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*, store:store_id(*)')
    .eq('id', session.user.id)
    .single();
  
  if (userError) {
    console.error('Error fetching user data:', userError);
    return <div className="p-4">Error loading subscription information</div>;
  }
  
  // Get subscription data
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (subscriptionError && subscriptionError.code !== 'PGRST116') {
    console.error('Error fetching subscription data:', subscriptionError);
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      <SubscriptionManagement 
        user={userData} 
        subscription={subscriptionData || null} 
      />
    </div>
  );
} 