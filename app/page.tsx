"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Package, ShoppingCart, Users, CheckCircle2, RefreshCw } from 'lucide-react'
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

  useEffect(() => {
    setIsMounted(true)
    loadStats()
  }, [])

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
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
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
      <section className="py-20">
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
                            <span className="text-3xl font-bold">₱{plan.monthlyPrice}</span>
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
                    Start managing your inventory and sales more efficiently today.
                  </p>
                  <Button
                    size="lg"
                    asChild
                  >
                    <Link href="/register">
                      Get Started Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  )
}
