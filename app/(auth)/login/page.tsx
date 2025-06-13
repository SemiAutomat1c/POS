'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/storage/supabase';
import { ArrowRight, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { navigateToDashboard } from '@/lib/navigation';
import { AuthLoading } from '@/components/ui/loading';

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [formValues, setFormValues] = useState({
    username: '',
    password: ''
  });
  const justRegistered = searchParams.get('registered') === 'true';
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Login page: Checking for existing session...');
        
        // Clear any redirect loop prevention cookie
        if (document.cookie.includes('redirect_loop_prevention')) {
          document.cookie = "redirect_loop_prevention=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          console.log('Login page: Cleared redirect loop prevention cookie');
        }
        
        // Clear auth redirect cookie
        if (document.cookie.includes('auth_redirect')) {
          document.cookie = "auth_redirect=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          console.log('Login page: Cleared auth redirect cookie');
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Login page: Error checking session:', error);
          setInitialLoading(false);
          return;
        }
        
        if (data.session) {
          console.log('Login page: User is already logged in, redirecting to dashboard');
          // Set cookie to prevent flicker
          document.cookie = "redirect_loop_prevention=true; path=/; max-age=60";
          window.location.href = redirectPath;
          return;
        }
        
        setInitialLoading(false);
      } catch (err) {
        console.error('Login page: Error checking session:', err);
        setInitialLoading(false);
      }
    };
    
    checkSession();
  }, [redirectPath]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, get email from username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('username', formValues.username)
        .single();
      
      if (userError || !userData) {
        console.error('Error finding user:', userError);
        setError('Username not found. Please check your credentials.');
        setLoading(false);
        return;
      }
      
      console.log('Found user email:', userData.email);
      
      // Try Supabase login with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: formValues.password,
      });

      if (error) {
        console.error('Login error:', error);
        setError('Invalid username or password. Please try again.');
        setLoading(false);
        return;
      }

      console.log('Login successful:', data);
      setLoginSuccess(true);
      
      // Set cookie to prevent flicker
      document.cookie = "redirect_loop_prevention=true; path=/; max-age=60";
      
      // Redirect to dashboard or the original requested URL
      window.location.href = redirectPath;
      
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  // Use effect to handle successful login
  useEffect(() => {
    if (loginSuccess) {
      // Add a delay before redirecting to ensure Supabase session is properly set
      const redirectTimer = setTimeout(() => {
        console.log(`Redirecting to ${redirectPath}...`);
        window.location.href = redirectPath;
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [loginSuccess, redirectPath]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show loading state while checking initial session
  if (initialLoading) {
    return <AuthLoading />;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
            {justRegistered && (
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 p-2 rounded-md">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Registration successful! Please login.</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    placeholder="your username"
                    type="text"
                    autoComplete="username"
                    required
                    className="pl-10"
                    value={formValues.username}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10"
                    value={formValues.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2"
                disabled={loading || loginSuccess}
              >
                {loading || loginSuccess ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    {loginSuccess ? 'Redirecting...' : 'Logging in...'}
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-center text-sm w-full">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 