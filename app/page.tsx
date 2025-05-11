"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react"
import { initializeDB } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProducts } from "@/store/slices/productSlice"
import { fetchSales } from "@/store/slices/saleSlice"
import { fetchCustomers } from "@/store/slices/customerSlice"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const dispatch = useAppDispatch()
  
  // Get data from Redux store
  const products = useAppSelector((state) => state.products.items)
  const productStatus = useAppSelector((state) => state.products.status)
  const sales = useAppSelector((state) => state.sales.items)
  const salesStatus = useAppSelector((state) => state.sales.status)
  const customers = useAppSelector((state) => state.customers.items)
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalSales: 0,
    pendingPayments: 0,
  })

  // Calculate real stats from actual data
  useEffect(() => {
    if (products.length >= 0 && sales.length >= 0) {
      const lowStockItems = products.filter(product => 
        product.quantity <= (product.minStockLevel || 5)
      );
      
      // Calculate today's sales (in a real app, you'd filter by today's date)
      const todaySales = sales.length > 0 ? sales.length : 0;
      
      // For pending payments, in a real app you'd track installment plans
      // For now we'll just show 0
      const pendingPayments = 0;
      
      setStats({
        totalProducts: products.length,
        lowStock: lowStockItems.length,
        totalSales: todaySales,
        pendingPayments: pendingPayments
      });
    }
  }, [products, sales]);

  const loadData = async () => {
    try {
      await initializeDB()
      
      // Load data from Redux
      if (productStatus === 'idle') {
        dispatch(fetchProducts())
      }
      
      if (salesStatus === 'idle') {
        dispatch(fetchSales())
      }
      
      dispatch(fetchCustomers())
      
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    dispatch(fetchProducts())
    dispatch(fetchSales())
    dispatch(fetchCustomers())
    
    // Short delay to allow state to update
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const StatCard = ({ title, value, icon: Icon, description, color }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        {isLoading || productStatus === 'loading' || salesStatus === 'loading' ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your gadget shop inventory and sales</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing || productStatus === 'loading' || salesStatus === 'loading'}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing || productStatus === 'loading' || salesStatus === 'loading' ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
          description="items in inventory"
        />
        <StatCard
          title="Low Stock Items"
          value={stats.lowStock}
          icon={AlertTriangle}
          description="items need reordering"
          color="text-destructive"
        />
        <StatCard
          title="Today's Sales"
          value={stats.totalSales}
          icon={ShoppingCart}
          description="total transactions today"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={Users}
          description="awaiting payment"
          color="text-amber-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest transactions from your store</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || salesStatus === 'loading' ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : sales.length > 0 ? (
              <div className="space-y-4">
                {sales.slice(0, 3).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">Sale #{sale.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {sale.customerId || 'Walk-in'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₱{sale.total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(sale.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No sales records yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
            <CardDescription>Customers who shopped at your store</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : customers.length > 0 ? (
              <div className="space-y-4">
                {customers.slice(0, 3).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email || 'No email'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{customer.phone || 'No phone'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No customers added yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
