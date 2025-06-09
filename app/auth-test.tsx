'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/storage/supabase';
import { Button } from '@/components/ui/button';

export default function AuthTest() {
  const [authState, setAuthState] = useState<{
    loading: boolean;
    session: any;
    user: any;
    error: any;
  }>({
    loading: true,
    session: null,
    user: null,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
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

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      {authState.loading ? (
        <div>Checking authentication state...</div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 border rounded">
            <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
            <p>
              <strong>Authenticated:</strong> {authState.session ? 'Yes' : 'No'}
            </p>
            {authState.error && (
              <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
                <strong>Error:</strong> {authState.error.message}
              </div>
            )}
          </div>

          {authState.session && (
            <div className="p-4 border rounded">
              <h2 className="text-xl font-semibold mb-2">Session Information</h2>
              <pre className="bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(authState.session, null, 2)}
              </pre>
            </div>
          )}

          {authState.user && (
            <div className="p-4 border rounded">
              <h2 className="text-xl font-semibold mb-2">User Information</h2>
              <p><strong>ID:</strong> {authState.user.id}</p>
              <p><strong>Email:</strong> {authState.user.email}</p>
              <pre className="bg-gray-100 p-2 rounded overflow-auto mt-2">
                {JSON.stringify(authState.user, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-4">
            {authState.session ? (
              <>
                <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
                <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
              </>
            ) : (
              <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 