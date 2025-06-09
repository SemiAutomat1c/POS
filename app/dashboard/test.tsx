'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/storage/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, RefreshCw } from 'lucide-react';
import { Session, User, AuthError } from '@supabase/supabase-js';

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  error: AuthError | null | unknown;
}

export default function DashboardTest() {
  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    session: null,
    user: null,
    error: null
  });

  const checkAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setAuthState({
          loading: false,
          session: null,
          user: null,
          error: sessionError
        });
        return;
      }

      // Get user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      setAuthState({
        loading: false,
        session: sessionData.session,
        user: userData.user,
        error: userError
      });
    } catch (error) {
      setAuthState({
        loading: false,
        session: null,
        user: null,
        error
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Test Page</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={checkAuth} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="destructive" onClick={handleSignOut} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            {authState.loading ? (
              <div className="flex items-center">
                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary mr-2"></div>
                <span>Checking authentication...</span>
              </div>
            ) : (
              <div>
                <p className="mb-2">
                  <strong>Status:</strong> {authState.session ? 'Authenticated' : 'Not Authenticated'}
                </p>
                {authState.error && (
                  <div className="p-2 bg-red-100 text-red-800 rounded mb-4">
                    <strong>Error:</strong> {
                      authState.error instanceof Error 
                        ? authState.error.message 
                        : 'Unknown error'
                    }
                  </div>
                )}
                {authState.user && (
                  <div>
                    <p><strong>User ID:</strong> {authState.user.id}</p>
                    <p><strong>Email:</strong> {authState.user.email}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => window.location.href = '/dashboard'}>
                Main Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/auth-test'}>
                Auth Test Page
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard/simple'}>
                Simple Dashboard
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Landing Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 