"use client"

import { motion } from 'framer-motion'
import { ArrowRight, Package, ShoppingCart, Users, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from "next/link"
import { plans } from '@/lib/subscription/plans'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export default function LandingPage() {
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
          <motion.h1 
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to GadgetTrack
          </motion.h1>
          <motion.p 
            className="mt-6 text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Your complete solution for inventory and point-of-sale management
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center"
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
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

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
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
        </div>
      </section>
    </div>
  )
}
