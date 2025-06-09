"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  Package, 
  ShoppingCart, 
  Users, 
  CheckCircle2, 
  RefreshCw, 
  Smartphone, 
  Laptop, 
  Download, 
  Apple, 
  Chrome, 
  Globe,
  Plus,
  PlusSquare,
  Share,
  MoreVertical,
  ArrowDownToLine
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from "next/link"
import { plans } from '@/lib/subscription/plans'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { getProducts, getCustomers, getSales, getReturns } from '@/lib/db-adapter'
import { demoStats } from '@/lib/demo-data'
import { supabase } from '@/lib/storage/supabase'
import { AuthLoading } from '@/components/ui/loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Safari icon component since it's not included in lucide-react
const Safari = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="12" y1="2" x2="12" y2="22" />
    <polyline points="16.25 7.75 12 12 7.75 16.25" />
    <line x1="7.75" y1="7.75" x2="16.25" y2="16.25" />
  </svg>
);

interface StatCardProps {
  title: string;
  value: number | null;
  icon: React.ElementType;
  description: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {!value && value !== 0 ? (
          <div className="space-y-2">
            <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [initialAuthChecking, setInitialAuthChecking] = useState(true)
  const [stats, setStats] = useState<{
    totalProducts: number | null,
    totalCustomers: number | null,
    totalSales: number | null,
    totalReturns: number | null
  }>({
    totalProducts: null,
    totalCustomers: null,
    totalSales: null,
    totalReturns: null
  })
  const { toast } = useToast()

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Landing page: Checking for existing session...');
        
        // Clear any redirect loop prevention cookie
        if (document.cookie.includes('redirect_loop_prevention')) {
          document.cookie = "redirect_loop_prevention=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          console.log('Landing page: Cleared redirect loop prevention cookie');
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Landing page: Error checking session:', error);
          setInitialAuthChecking(false);
          return;
        }
        
        if (data.session) {
          console.log('Landing page: User is already logged in, redirecting to dashboard');
          // Set cookie to prevent flicker
          document.cookie = "redirect_loop_prevention=true; path=/; max-age=60";
          window.location.href = '/dashboard';
          return;
        }
        
        setInitialAuthChecking(false);
      } catch (err) {
        console.error('Landing page: Error checking session:', err);
        setInitialAuthChecking(false);
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    if (!initialAuthChecking) {
      setIsMounted(true)
      loadStats()
    }
  }, [initialAuthChecking])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      
      try {
        // Try to get real data first
      const [products, customers, sales, returns] = await Promise.allSettled([
        getProducts(),
        getCustomers(),
        getSales(),
        getReturns()
      ])

        // Check if we got actual data
        if (products.status === 'fulfilled' && 
            customers.status === 'fulfilled' && 
            sales.status === 'fulfilled' && 
            returns.status === 'fulfilled') {
          
          setStats({
            totalProducts: products.value.length,
            totalCustomers: customers.value.length,
            totalSales: sales.value.length,
            totalReturns: returns.value.length
          })
          return
        }
      } catch (error) {
        // Silently catch authentication errors
        console.log('Not authenticated, using demo data')
      }
      
      // Fall back to demo data if not authenticated or data fetch failed
      setStats({
        totalProducts: demoStats.totalProducts,
        totalCustomers: demoStats.totalCustomers,
        totalSales: demoStats.totalSales,
        totalReturns: demoStats.totalReturns
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      // Use demo data as fallback
      setStats({
        totalProducts: demoStats.totalProducts,
        totalCustomers: demoStats.totalCustomers,
        totalSales: demoStats.totalSales,
        totalReturns: demoStats.totalReturns
      })
    } finally {
      setIsLoading(false)
    }
  }

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
  ]

  // Show loading state while checking auth
  if (initialAuthChecking) {
    return <AuthLoading />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center py-20 bg-gradient-to-b from-background to-background/95">
        <div className="container text-center max-w-3xl">
          <AnimatePresence>
            {isMounted && (
              <>
                <motion.h1 
                  className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  layout
                >
                  Welcome to GadgetTrack
                </motion.h1>
                <motion.p 
                  className="mt-6 text-lg text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  layout
                >
                  Your complete solution for inventory and point-of-sale management
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center"
                  layout
                >
                  <Button asChild size="lg" className="gap-2">
                    <Link href="#pricing" onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#pricing')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}>
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link href="#installation" onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#installation')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }}>
                      <Smartphone className="h-4 w-4" />
                      Install on Device
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/dashboard/demo">Live Demo</Link>
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <AnimatePresence>
            {isMounted && (
              <>
                <motion.h2
                  className="text-3xl font-bold text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  layout
                >
                  Everything you need to manage your gadget store
                </motion.h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      layout
                    >
                      <Card className="relative overflow-hidden p-6 h-full">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                          {feature.icon}
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                        <p className="mt-2 text-muted-foreground">{feature.description}</p>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            layout
          >
            Real-time Dashboard Stats
          </motion.h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatCard
            title="Total Products"
                value={isLoading ? null : stats.totalProducts}
            icon={Package}
            description="Products in inventory"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard
            title="Total Customers"
                value={isLoading ? null : stats.totalCustomers}
            icon={Users}
            description="Registered customers"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatCard
            title="Total Sales"
                value={isLoading ? null : stats.totalSales}
            icon={ShoppingCart}
            description="Completed sales"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StatCard
            title="Total Returns"
                value={isLoading ? null : stats.totalReturns}
            icon={RefreshCw}
            description="Processed returns"
          />
        </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container">
          <AnimatePresence>
            {isMounted && (
              <>
                <motion.h2 
                  className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  layout
                >
                  Choose the Perfect Plan
                </motion.h2>
                <motion.div 
                  className="grid gap-8 md:grid-cols-2 lg:grid-cols-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  layout
                >
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      layout
                    >
                      <Card
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
                            {plan.id === 'enterprise' ? (
                              <span className="text-3xl font-bold">Coming soon!</span>
                            ) : (
                              <>
                                <span className="text-3xl font-bold">₱{plan.monthlyPrice}</span>
                                <span className="text-muted-foreground">/month</span>
                              </>
                            )}
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
                            asChild={plan.id !== 'enterprise'}
                            disabled={plan.id === 'enterprise'}
                          >
                            {plan.id === 'enterprise' ? (
                              <div>Coming Soon</div>
                            ) : (
                            <Link href={`/register?plan=${plan.id}`}>
                              {plan.id === 'free' ? 'Get Started' : 'Start Free Trial'}
                            </Link>
                            )}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Installation Guide Section */}
      <section id="installation" className="py-20 bg-muted/30">
        <div className="container">
          <AnimatePresence>
            {isMounted && (
              <>
                <motion.div className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  layout
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                    <Download className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <motion.h2 
                    className="text-3xl font-bold tracking-tighter text-center sm:text-4xl md:text-5xl mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    layout
                  >
                    Install on Any Device
                  </motion.h2>
                  <motion.p
                    className="text-center text-lg text-muted-foreground max-w-3xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    layout
                  >
                    GadgetTrack works everywhere! Install our app on your phone, tablet, or computer for the best experience.
                  </motion.p>
                </motion.div>

                <Tabs defaultValue="ios" className="w-full max-w-4xl mx-auto">
                  <motion.div
                    className="flex justify-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <TabsList className="grid grid-cols-3 w-full max-w-md">
                      <TabsTrigger value="ios" className="flex items-center justify-center gap-2 py-3">
                        <Apple className="h-5 w-5" />
                        <span>iOS</span>
                      </TabsTrigger>
                      <TabsTrigger value="android" className="flex items-center justify-center gap-2 py-3">
                        <Smartphone className="h-5 w-5" />
                        <span>Android</span>
                      </TabsTrigger>
                      <TabsTrigger value="desktop" className="flex items-center justify-center gap-2 py-3">
                        <Laptop className="h-5 w-5" />
                        <span>Desktop</span>
                      </TabsTrigger>
                    </TabsList>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <TabsContent value="ios" className="mt-0">
                      <Card className="border-primary/20 shadow-lg">
                        <CardHeader className="text-center border-b pb-8">
                          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Apple className="h-6 w-6 text-primary" />
                            Install on iPhone or iPad
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">1</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Open in Safari</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <Safari className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Visit app.gadgettrack.com in Safari browser
                              </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">2</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Tap Share Icon</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <Share className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Tap the share button at the bottom of the screen
                              </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">3</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Add to Home Screen</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <PlusSquare className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Scroll down and tap "Add to Home Screen"
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="android" className="mt-0">
                      <Card className="border-primary/20 shadow-lg">
                        <CardHeader className="text-center border-b pb-8">
                          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Smartphone className="h-6 w-6 text-primary" />
                            Install on Android Devices
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">1</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Open in Chrome</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <Chrome className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Visit app.gadgettrack.com in Chrome browser
                              </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">2</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Tap Menu</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <MoreVertical className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Tap the three dots menu in the top right
                              </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">3</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Install App</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <ArrowDownToLine className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Select "Install App" or "Add to Home Screen"
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="desktop" className="mt-0">
                      <Card className="border-primary/20 shadow-lg">
                        <CardHeader className="text-center border-b pb-8">
                          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Laptop className="h-6 w-6 text-primary" />
                            Install on Desktop
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">1</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Open in Browser</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <Globe className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Visit app.gadgettrack.com in Chrome or Edge
                              </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">2</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Look for Install Icon</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <Plus className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Look for the install icon in the address bar
                              </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-2xl font-bold text-primary">3</span>
                              </div>
                              <h3 className="text-xl font-medium mb-3">Install App</h3>
                              <div className="rounded-lg bg-muted p-3 mb-4">
                                <ArrowDownToLine className="h-8 w-8 mx-auto text-primary/70 mb-2" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Click "Install" and follow the prompts
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </motion.div>
                </Tabs>
              </>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <AnimatePresence>
            {isMounted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                layout
              >
                <Card className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Ready to streamline your business?</h2>
                  <p className="text-muted-foreground mb-8">
                    Start managing your inventory and sales more efficiently today. Available on all your devices.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      asChild
                    >
                      <Link href="#pricing" onClick={(e) => {
                        e.preventDefault();
                        document.querySelector('#pricing')?.scrollIntoView({ 
                          behavior: 'smooth' 
                        });
                      }}>
                        Get Started Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                    >
                      <Link href="#installation" onClick={(e) => {
                        e.preventDefault();
                        document.querySelector('#installation')?.scrollIntoView({ 
                          behavior: 'smooth' 
                        });
                      }}>
                        <Download className="mr-2 h-4 w-4" />
                        Install App
                      </Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
