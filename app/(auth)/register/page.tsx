'use client';

import { useState, useEffect, Suspense } from 'react';
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

// Create a client component that safely uses useSearchParams
function RegisterContent() {
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
    setMounted(true);
    
    // Update plan from URL param after mounting
    if (planParam && ['free', 'basic', 'premium', 'enterprise'].includes(planParam)) {
      console.log('Setting plan from URL parameter:', planParam);
      setFormValues(prev => ({
        ...prev,
        plan: planParam
      }));
    }
  }, [planParam]);
  
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

  // If registration was successful
  if (registrationSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-green-600">
                Registration Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {emailConfirmationRequired ? (
                <div>
                  <p className="mb-4">
                    We've sent a confirmation email to <strong>{registeredEmail}</strong>.
                  </p>
                  <p>
                    Please check your inbox and click the confirmation link to activate your account.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-4">
                    Your account has been created successfully.
                  </p>
                  <p>
                    You will be redirected to the login page shortly.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => router.push('/login')}
              >
                Go to Login
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
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
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="you@example.com" 
                      className="pl-10"
                      value={formValues.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="username" 
                      name="username"
                      placeholder="yourname" 
                      className="pl-10"
                      value={formValues.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="storeName" 
                      name="storeName"
                      placeholder="Your Store" 
                      className="pl-10"
                      value={formValues.storeName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      id="password" 
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10"
                      value={formValues.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select 
                    name="plan" 
                    value={formValues.plan}
                    onValueChange={(value) => setFormValues(prev => ({ ...prev, plan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      {plans.map((plan) => (
                        <SelectItem 
                          key={plan.id} 
                          value={plan.id} 
                          className="py-2"
                          disabled={plan.id === 'enterprise'}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between">
                              <span className="font-medium">{plan.name}</span> 
                              <span>{plan.id === 'free' || plan.id === 'enterprise' ? 'Free' : `₱${plan.monthlyPrice}/month`}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{plan.description}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              <span>Up to {plan.limits.products} products • </span>
                              <span>{plan.limits.users} users • </span>
                              <span>{plan.limits.locations} location{plan.limits.locations > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    You can change your plan later
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      <span className="ml-2">Creating account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span>Create account</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">
              By clicking continue, you agree to our{' '}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

// Main component that wraps the content in Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <RegisterContent />
    </Suspense>
  );
} 