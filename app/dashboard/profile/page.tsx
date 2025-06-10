'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/storage/supabase';
import { User, Mail, Building, ShieldCheck, CalendarClock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLoading } from '@/components/ui/loading';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  store_id: string;
  store_name?: string;
  subscription_tier?: string;
  subscription_status?: string;
  created_at?: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for authentication on mount and set a cookie to prevent redirect loops
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.cookie = "redirect_loop_prevention=true; path=/; max-age=60";
    }
  }, []);

  useEffect(() => {
    async function fetchUserProfile() {
      if (authLoading) return; // Wait for auth to complete
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user profile data including subscription information
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, username, email, role, store_id, created_at, subscription_tier, subscription_status')
          .eq('id', user.id)
          .single();
          
        if (userError) throw new Error(userError.message);
        
        // Fetch store data - only get the name
        let storeData = { name: 'Unknown' };
        
        if (userData.store_id) {
          const { data: storeResult, error: storeError } = await supabase
            .from('stores')
            .select('name')
            .eq('id', userData.store_id)
            .single();
            
          if (!storeError && storeResult) {
            storeData = storeResult;
          }
        }
        
        setProfile({
          ...userData,
          store_name: storeData.name
        });
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [user, authLoading]);

  // Show loading state while checking authentication
  if (authLoading) {
    return <AuthLoading />;
  }

  // Show not authenticated state if user is not logged in
  if (!authLoading && !user) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Not Authenticated</h1>
          <p className="mt-2 text-muted-foreground">Please log in to view your profile.</p>
          <Button 
            className="mt-4" 
            onClick={() => {
              // Clear any redirect prevention cookies before redirecting
              document.cookie = "redirect_loop_prevention=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              router.push('/login?redirect=/dashboard/profile');
            }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                User Information
              </CardTitle>
              <CardDescription>Your personal details and account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : error ? (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                  <p>Error loading profile: {error}</p>
                  <p className="mt-2">Please try refreshing the page.</p>
                </div>
              ) : profile ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Username</p>
                    <p className="flex items-center text-sm text-muted-foreground">
                      <User className="mr-2 h-4 w-4" />
                      {profile.username}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email Address</p>
                    <p className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4" />
                      {profile.email}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Account Role</p>
                    <p className="flex items-center text-sm text-muted-foreground">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      {profile.role ? (profile.role.charAt(0).toUpperCase() + profile.role.slice(1)) : 'User'}
                    </p>
                  </div>
                  
                  {profile.created_at && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="flex items-center text-sm text-muted-foreground">
                        <CalendarClock className="mr-2 h-4 w-4" />
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No profile information available.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Store & Subscription
              </CardTitle>
              <CardDescription>Your store details and subscription information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ) : error ? (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                  <p>Error loading store data</p>
                </div>
              ) : profile ? (
                <>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Store Name</p>
                    <p className="flex items-center text-sm text-muted-foreground">
                      <Building className="mr-2 h-4 w-4" />
                      {profile.store_name || 'Not available'}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Subscription Plan</p>
                    <div className="mt-1 flex items-center justify-between rounded-md bg-primary/10 p-2 text-sm">
                      <span className="font-medium capitalize">{profile.subscription_tier || 'Free'}</span>
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground capitalize">
                        {profile.subscription_status || 'Active'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Plan Features</p>
                    <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                      {(!profile.subscription_tier || profile.subscription_tier === 'free') && (
                        <>
                          <li className="flex items-center">• Basic features only</li>
                          <li className="flex items-center">• Limited to 50 products</li>
                          <li className="flex items-center">• 2 user accounts</li>
                        </>
                      )}
                      {profile.subscription_tier === 'basic' && (
                        <>
                          <li className="flex items-center">• Standard features</li>
                          <li className="flex items-center">• Up to 200 products</li>
                          <li className="flex items-center">• 5 user accounts</li>
                        </>
                      )}
                      {profile.subscription_tier === 'premium' && (
                        <>
                          <li className="flex items-center">• Advanced features</li>
                          <li className="flex items-center">• Up to 1000 products</li>
                          <li className="flex items-center">• 10 user accounts</li>
                        </>
                      )}
                      {profile.subscription_tier === 'enterprise' && (
                        <>
                          <li className="flex items-center">• All features</li>
                          <li className="flex items-center">• Up to 5000 products</li>
                          <li className="flex items-center">• 25 user accounts</li>
                          <li className="flex items-center">• Priority support</li>
                        </>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No subscription information available.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                asChild
                variant="outline" 
                className="w-full"
              >
                <Link href="/dashboard/subscription">
                  Manage Subscription
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 