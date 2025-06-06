"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, RefreshCw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { motion } from 'framer-motion'
import { useRouter } from "next/navigation"
import { getProducts, getCustomers, getSales, getReturns } from '@/lib/db-adapter'

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

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
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

  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  )
} 