"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, RefreshCw, Settings, Eye, Calendar, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { motion } from 'framer-motion'
import { useRouter } from "next/navigation"
import { getProducts, getCustomers, getSales, getReturns } from '@/lib/db-adapter'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDistanceToNow } from 'date-fns'
import Link from "next/link"

interface DashboardStats {
  totalSales: number;
  totalProducts: number;
  totalCustomers: number;
  totalReturns: number;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

interface Sale {
  id: string;
  customer: {
    id: string;
    name: string;
  };
  sale_date: string;
  total_amount: number;
  status: string;
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

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalReturns: 0
  })
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([])
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadStats() {
      try {
        const [products, customers, sales, returns] = await Promise.all([
          getProducts(),
          getCustomers(),
          getSales(),
          getReturns()
        ])

        setStats({
          totalProducts: products.length,
          totalCustomers: customers.length,
          totalSales: sales.length,
          totalReturns: returns.length
        })

        // Set recent sales and customers
        setRecentSales(sales.slice(0, 5))
        setRecentCustomers(customers.slice(0, 5))
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [toast])
  
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

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
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
            value={stats.totalProducts}
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
            value={stats.totalCustomers}
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
            value={stats.totalSales}
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
            value={stats.totalReturns}
            icon={RefreshCw}
            description="Processed returns"
          />
        </motion.div>
      </section>

      {/* Quick Actions */}
      <section>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/dashboard/sales/new')}
            >
              <ShoppingCart className="h-6 w-6" />
              New Sale
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/dashboard/inventory/add')}
            >
              <Package className="h-6 w-6" />
              Add Product
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/dashboard/customers/new')}
            >
              <Users className="h-6 w-6" />
              Add Customer
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-6 w-6" />
              Settings
            </Button>
          </div>
        </Card>
      </section>
      
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
                <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                  <Link href="/dashboard/sales">
                    <Eye className="h-4 w-4" />
                    <span>View All</span>
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[160px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentSales.length > 0 ? (
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
                    {recentSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">{sale.customer?.name || 'Unknown'}</TableCell>
                        <TableCell>{formatDate(sale.sale_date)}</TableCell>
                        <TableCell>₱{sale.total_amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700">
                            {sale.status || 'Completed'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No sales recorded yet
                </div>
              )}
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
                <Button variant="ghost" size="sm" className="h-8 gap-1" asChild>
                  <Link href="/dashboard/customers">
                    <Eye className="h-4 w-4" />
                    <span>View All</span>
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[160px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentCustomers.length > 0 ? (
                <div className="space-y-4">
                  {recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                      <div className="ml-auto text-sm text-muted-foreground">
                        {formatDate(customer.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No customers added yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  )
} 