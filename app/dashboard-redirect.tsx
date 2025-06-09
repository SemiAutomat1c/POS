'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/storage/supabase';

export default function DashboardRedirect() {
  const [countdown, setCountdown] = useState(3);
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Check authentication status first
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth status:', error);
          setErrorMessage('Error checking authentication status: ' + error.message);
          setAuthStatus('unauthenticated');
          return;
        }
        
        if (data.session) {
          console.log('User is authenticated, will redirect to dashboard');
          setAuthStatus('authenticated');
          
          // Immediate redirect to dashboard
          window.location.href = '/dashboard';
        } else {
          console.log('No active session found');
          setAuthStatus('unauthenticated');
          setErrorMessage('You are not logged in. Please sign in first.');
        }
      } catch (error) {
        console.error('Unexpected error during auth check:', error);
        setErrorMessage('Unexpected error during authentication check.');
        setAuthStatus('unauthenticated');
      }
    };
    
    checkAuth();
  }, []);

  // Function to handle manual redirect
  const handleRedirect = () => {
    window.location.href = '/dashboard';
  };

  // Function to handle simple dashboard redirect
  const handleSimpleRedirect = () => {
    window.location.href = '/dashboard/simple';
  };

  // Function to handle test redirect
  const handleTestRedirect = () => {
    window.location.href = '/dashboard/test';
  };
  
  // Function to go to login
  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Dashboard Access
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {authStatus === 'checking' && (
            <div className="flex flex-col items-center py-6">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Checking authentication status...</p>
            </div>
          )}
          
          {authStatus === 'authenticated' && (
            <>
              <div className="flex items-center justify-center mb-4 text-green-600">
                <Shield className="h-6 w-6 mr-2" />
                <span>You are authenticated</span>
              </div>
              <p className="mb-4">
                Redirecting you to the dashboard...
              </p>
              <div className="space-y-2 mt-6">
                <Button
                  onClick={handleRedirect}
                  className="w-full"
                >
                  Go to Dashboard Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <Button
                  onClick={handleSimpleRedirect}
                  variant="outline"
                  className="w-full"
                >
                  Go to Simple Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
          
          {authStatus === 'unauthenticated' && (
            <>
              <div className="flex items-center justify-center mb-4 text-destructive">
                <AlertCircle className="h-6 w-6 mr-2" />
                <span>Authentication Required</span>
              </div>
              {errorMessage && (
                <p className="mb-6 text-destructive">{errorMessage}</p>
              )}
              <Button
                onClick={handleLoginRedirect}
                className="w-full"
              >
                Go to Login Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          {authStatus === 'authenticated' && (
            <span>If you are not redirected automatically, please click the button above.</span>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 