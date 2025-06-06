'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Package, ShoppingCart, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { plans } from '@/lib/subscription/plans';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const features = [
    {
      title: 'Inventory Management',
      description: 'Track stock levels, set reorder points, and manage product variants with ease.',
      icon: <Package className="h-6 w-6" />,
    },
    {
      title: 'Point of Sale',
      description: 'Fast and intuitive checkout process with support for multiple payment methods.',
      icon: <ShoppingCart className="h-6 w-6" />,
    },
    {
      title: 'Customer Management',
      description: 'Build lasting relationships with customer profiles and purchase history.',
      icon: <Users className="h-6 w-6" />,
    },
  ];

  const benefits = [
    {
      title: "Save Time and Money",
      description: "Automate routine tasks and reduce manual errors, saving your business valuable time and resources."
    },
    {
      title: "Increase Sales",
      description: "Optimize stock levels and identify sales trends to boost your revenue and profitability."
    },
    {
      title: "Better Customer Experience",
      description: "Provide faster service and personalized experiences with integrated customer data."
    },
    {
      title: "Scale with Confidence",
      description: "Our platform grows with your business, supporting everything from single stores to large chains."
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Hero Section with Login Form */}
      <section className="px-6 py-24 md:px-12 md:py-32 lg:py-40 bg-gradient-to-b from-background to-background/95">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Streamline Your Inventory <br />
              <span className="text-primary">Like Never Before</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              GadgetTrack helps you manage inventory, track sales, and grow your business with powerful tools and real-time insights.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6">
              <Button asChild size="lg" className="gap-2">
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/demo">View Demo</Link>
              </Button>
            </div>
          </div>
          
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Login to Your Account</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:py-32">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl">
            Everything You Need to Succeed
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col gap-2 rounded-lg border p-6">
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-muted/50 md:py-32">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12">
            Choose the Perfect Plan
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col ${
                  plan.recommended ? 'border-primary' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {plan.recommended && (
                      <Badge variant="secondary">Recommended</Badge>
                    )}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <Separator className="my-4" />
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle2 
                          className={`h-4 w-4 ${
                            feature.included 
                              ? 'text-primary' 
                              : 'text-muted-foreground/40'
                          }`} 
                        />
                        <span className="text-sm">{feature.name}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-2">Limits:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Up to {plan.limits.locations} locations</li>
                      <li>Up to {plan.limits.users} users</li>
                      <li>Up to {plan.limits.products} products</li>
                    </ul>
                  </div>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button
                    className="w-full"
                    variant={plan.recommended ? "default" : "outline"}
                    asChild
                  >
                    <Link href={`/register?plan=${plan.id}`}>
                      {plan.id === 'free' ? 'Get Started' : 'Start Free Trial'}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 md:py-32">
        <div className="container">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl">
            Why Choose GadgetTrack?
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="mt-1 text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:py-32">
        <div className="container">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to Transform Your Business?
            </h2>
            <p className="mt-4 max-w-[600px] text-muted-foreground md:text-lg">
              Join thousands of businesses already using GadgetTrack to streamline their operations.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/register">Start Your Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
} 