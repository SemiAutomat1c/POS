'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/storage/supabase';
import { ArrowRight, User, Mail, Building, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { plans } from '@/lib/subscription/plans';
import { AuthLoading } from '@/components/ui/loading';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan');
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    username: '',
    password: '',
    storeName: '',
    plan: 'free' // Default to free, will update in useEffect
  });
  
  const [mounted, setMounted] = useState(false);
  
  // Check if already logged in and redirect to dashboard
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Register page: Checking for existing session...');
        
        // Clear any redirect loop prevention cookie
        if (document.cookie.includes('redirect_loop_prevention')) {
          document.cookie = "redirect_loop_prevention=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          console.log('Register page: Cleared redirect loop prevention cookie');
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Register page: Error checking session:', error);
          setInitialLoading(false);
          setMounted(true);
          return;
        }
        
        if (data.session) {
          console.log('Register page: User is already logged in, redirecting to dashboard');
          // Set cookie to prevent flicker
          document.cookie = "redirect_loop_prevention=true; path=/; max-age=60";
          window.location.href = '/dashboard';
          return;
        }
        
        setInitialLoading(false);
        setMounted(true);
      } catch (err) {
        console.error('Register page: Error checking session:', err);
        setInitialLoading(false);
        setMounted(true);
      }
    };
    
    checkSession();
  }, []);
  
  // Set mounted state to true when component mounts
  useEffect(() => {
    // Update plan from URL param after mounting
    if (mounted && planParam && ['free', 'basic', 'premium', 'enterprise'].includes(planParam)) {
      setFormValues(prev => ({
        ...prev,
        plan: planParam
      }));
    }
  }, [planParam, mounted]);
  
  // Auto-redirect to login after successful registration
  useEffect(() => {
    let redirectTimeout: NodeJS.Timeout;
    
    if (registrationSuccess && !emailConfirmationRequired) {
      redirectTimeout = setTimeout(() => {
        router.push('/login?registered=true');
      }, 3000); // Redirect after 3 seconds
    }
    
    return () => {
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [registrationSuccess, emailConfirmationRequired, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { email, username, password, storeName, plan } = formValues;
    
    if (!email || !username || !password || !storeName) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Prevent enterprise plan selection
    if (plan === 'enterprise') {
      setError('Enterprise plan is not available yet. Please select another plan.');
      return;
    }
    
    setLoading(true);
    try {
      // First check if user already exists
      const checkResponse = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username
        }),
      });
      
      const checkData = await checkResponse.json();
      
      interface UserRecord {
        id: string;
        email: string;
        username: string;
      }
      
      if (checkData.exists) {
        // User already exists
        if (checkData.existingUsers?.some((user: UserRecord) => user.email === email)) {
          throw new Error('A user with this email already exists. Please use a different email or try to log in.');
        } else if (checkData.existingUsers?.some((user: UserRecord) => user.username === username)) {
          throw new Error('This username is already taken. Please choose a different username.');
        } else if (checkData.authUserExists) {
          throw new Error('This email is already registered. Please try to log in or use a different email.');
        } else {
          throw new Error('User already exists. Please try to log in or use different credentials.');
        }
      }
      
      // Try to register with Supabase Auth
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          storeName,
          username,
          subscriptionTier: plan
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Handle successful registration
      setEmailConfirmationRequired(data.emailConfirmationRequired || data.requiresEmailConfirmation);
      setRegisteredEmail(email);
      setRegistrationSuccess(true);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If still checking session or not mounted yet, show loading
  if (initialLoading) {
    return <AuthLoading />;
  }

  // If not mounted yet, return a simple loading state or null
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                Create your account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <User className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">
              Create your account
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Or{' '}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                sign in to your existing account
              </Link>
            </p>
          </CardHeader>
          
          <CardContent>
            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                <h3 className="text-sm font-medium">
                  Registration failed
                </h3>
                <div className="mt-2 text-sm">
                  <p>{error}</p>
                  {(error.includes('already exists') || error.includes('already registered') || error.includes('already taken')) && (
                    <div className="mt-4">
                      <p className="text-xs mb-2">
                        If you deleted your account and are trying to register again with the same details, 
                        you may need to clean up old data.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
                        onClick={async () => {
                          try {
                            setLoading(true);
                            const response = await fetch('/api/auth/cleanup-user', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                email: formValues.email,
                                username: formValues.username
                              }),
                            });
                            
                            const data = await response.json();
                            
                            if (data.success) {
                              setError('Old data cleaned up. Please try registering again.');
                            } else {
                              setError(`Cleanup failed: ${data.error || data.message || 'Unknown error'}`);
                            }
                          } catch (err: any) {
                            setError(`Cleanup error: ${err.message || 'Unknown error'}`);
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Clean Up Old Data
                      </Button>
                      
                      <p className="text-xs mt-3 text-center text-muted-foreground">
                        If automatic cleanup fails, try the{' '}
                        <Link href="/admin-cleanup.html" target="_blank" className="text-primary underline">
                          Admin Cleanup Tool
                        </Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {emailConfirmationRequired && registeredEmail && (
              <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-500">
                <h3 className="text-sm font-medium">
                  Registration successful!
                </h3>
                <div className="mt-2 text-sm">
                  <p>Please check your email ({registeredEmail}) to confirm your account.</p>
                </div>
              </div>
            )}
            
            {registrationSuccess && !emailConfirmationRequired && (
              <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-500">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <h3 className="text-sm font-medium">
                    Registration successful!
                  </h3>
                </div>
                <div className="mt-2 text-sm">
                  <p>Your account has been created successfully.</p>
                  <p className="mt-1">You selected the <strong>{formValues.plan}</strong> plan.</p>
                  <p className="mt-1">Redirecting to login page in a moment...</p>
                </div>
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-green-500/30 text-green-600 hover:bg-green-50 hover:text-green-700"
                    onClick={() => router.push('/login?registered=true')}
                  >
                    Go to Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {!registrationSuccess && !emailConfirmationRequired && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="pl-10"
                        placeholder="you@example.com"
                        value={formValues.email}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        className="pl-10"
                        placeholder="yourname"
                        value={formValues.username}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">This will be your login identifier</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        className="pl-10"
                        placeholder="••••••"
                        value={formValues.password}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeName">
                      Store name
                    </Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="storeName"
                        name="storeName"
                        type="text"
                        required
                        className="pl-10"
                        placeholder="My Awesome Store"
                        value={formValues.storeName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="plan">Selected Plan</Label>
                    <Select 
                      value={formValues.plan} 
                      onValueChange={(value) => setFormValues(prev => ({ ...prev, plan: value as 'free' | 'basic' | 'premium' | 'enterprise' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Starter - Free</SelectItem>
                        <SelectItem value="basic">Basic - ₱249/month</SelectItem>
                        <SelectItem value="premium">Premium - ₱499/month</SelectItem>
                        <SelectItem value="enterprise" disabled>Enterprise - Coming Soon</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="p-3 bg-muted rounded-md mt-2">
                      {formValues.plan === 'free' && (
                        <>
                          <p className="text-sm font-medium">Starter Plan</p>
                          <p className="text-xs text-muted-foreground">Basic features for small businesses</p>
                          <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                            <li>Up to 1 location</li>
                            <li>Up to 2 users</li>
                            <li>Up to 50 products</li>
                          </ul>
                        </>
                      )}
                      {formValues.plan === 'basic' && (
                        <>
                          <p className="text-sm font-medium">Basic Plan</p>
                          <p className="text-xs text-muted-foreground">Essential features for growing businesses</p>
                          <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                            <li>Up to 2 locations</li>
                            <li>Up to 10 users</li>
                            <li>Up to 100 products</li>
                            <li>Customer database</li>
                          </ul>
                        </>
                      )}
                      {formValues.plan === 'premium' && (
                        <>
                          <p className="text-sm font-medium">Premium Plan</p>
                          <p className="text-xs text-muted-foreground">Advanced features for established businesses</p>
                          <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                            <li>Up to 5 locations</li>
                            <li>Up to 15 users</li>
                            <li>Up to 500 products</li>
                            <li>Advanced analytics</li>
                            <li>API access</li>
                          </ul>
                        </>
                      )}
                      {formValues.plan === 'enterprise' && (
                        <>
                          <p className="text-sm font-medium">Enterprise Plan - Coming Soon</p>
                          <p className="text-xs text-muted-foreground">Full feature set with dedicated support</p>
                          <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside">
                            <li>Up to 10 locations</li>
                            <li>Up to 50 users</li>
                            <li>Up to 100,000 products</li>
                            <li>Custom reports</li>
                            <li>Dedicated support</li>
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="mr-2 h-4 w-4 animate-spin text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Registering...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex-col space-y-4 border-t bg-muted/50 p-6">
            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} GadgetTrack. All rights reserved.
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 