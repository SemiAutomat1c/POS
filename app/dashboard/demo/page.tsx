"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, RefreshCw, Settings, ArrowLeft, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { useRouter } from "next/navigation"
import Link from "next/link"
import { demoStats, demoSales, demoCustomers } from "@/lib/demo-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from 'date-fns'

interface StatCardProps {
  title: string;
  value: number;
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
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function DemoDashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch (error) {
      return 'Invalid date'
    }
  }
  
  // Function to get customer initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b border-border py-4 px-6">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold">GadgetTrack Demo</h1>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-8">
        <div className="container space-y-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-muted-foreground mt-2">
              This is a demo of the GadgetTrack POS dashboard. Explore the features of our system.
            </p>
          </div>

          {/* Stats Section */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 bg-background py-4 px-2 rounded-lg border border-border/30">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <StatCard
                title="Total Products"
                value={demoStats.totalProducts}
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
                value={demoStats.totalCustomers}
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
                value={demoStats.totalSales}
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
                value={demoStats.totalReturns}
                icon={RefreshCw}
                description="Processed returns"
              />
            </motion.div>
          </section>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => alert("This is a demo feature. Register for full access.")}
              >
                <ShoppingCart className="h-6 w-6" />
                New Sale
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => alert("This is a demo feature. Register for full access.")}
              >
                <Package className="h-6 w-6" />
                Add Product
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => alert("This is a demo feature. Register for full access.")}
              >
                <Users className="h-6 w-6" />
                Add Customer
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => alert("This is a demo feature. Register for full access.")}
              >
                <Settings className="h-6 w-6" />
                Settings
              </Button>
            </div>
          </Card>
          
          {/* Recent Activity Section */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Recent Sales */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => alert("This is a demo feature. Register for full access.")}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View All</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demoSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.customer_name}</TableCell>
                          <TableCell>{formatDate(sale.date)}</TableCell>
                          <TableCell>₱{sale.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700">
                              {sale.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.section>

            {/* Recent Customers */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Recent Customers</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 gap-1"
                      onClick={() => alert("This is a demo feature. Register for full access.")}
                    >
                      <Eye className="h-4 w-4" />
                      <span>View All</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoCustomers.map((customer) => (
                      <div key={customer.id} className="flex items-center gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                        </div>
                        <div className="ml-auto text-sm text-muted-foreground">
                          New customer
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>

          {/* Demo CTA */}
          <Card className="p-8 bg-primary/5 border-primary/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-6">
                This is just a preview of what GadgetTrack can do for your business. 
                Register now to access all features and start managing your inventory and sales effectively.
              </p>
              <Button size="lg" asChild>
                <Link href="/register">Sign Up for Free</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <footer className="bg-muted/30 py-6 border-t">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GadgetTrack POS. All rights reserved.
          <p className="mt-1">This is a demo version of our application.</p>
        </div>
      </footer>
    </div>
  )
} 