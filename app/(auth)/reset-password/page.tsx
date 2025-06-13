'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  // Check if the URL contains the necessary parameters
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setInvalidLink(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClientComponentClient();
      
      // Get the code from the URL
      const code = searchParams.get('code');
      
      if (!code) {
        throw new Error('Missing password reset code');
      }

      // Update the user's password
      const { error: resetError } = await supabase.auth.updateUser({
        password: password
      });

      if (resetError) {
        throw new Error(resetError.message || 'Failed to reset password');
      }

      // Password reset successful
      setSuccess(true);
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login?reset=success');
      }, 3000);
      
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  if (invalidLink) {
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
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-red-600">
                Invalid Reset Link
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                The password reset link is invalid or has expired.
              </p>
              <p>
                Please request a new password reset link.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => router.push('/forgot-password')}
                className="flex items-center gap-2"
              >
                Request New Link
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (success) {
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
              <CardTitle className="text-2xl font-bold tracking-tight text-green-600">
                Password Reset Successful
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4">
                Your password has been updated successfully.
              </p>
              <p>
                You will be redirected to the login page shortly.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                onClick={() => router.push('/login')}
                className="flex items-center gap-2"
              >
                Go to Login
                <ArrowRight className="h-4 w-4" />
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
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Enter your new password below
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    required
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    placeholder="••••••••"
                    type="password"
                    required
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <div className="text-center text-sm w-full">
              Remember your password?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Back to login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 