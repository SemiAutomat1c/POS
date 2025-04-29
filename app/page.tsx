"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react"
import { initializeDB } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalSales: 0,
    pendingPayments: 0,
  })

  const loadData = async () => {
    try {
      await initializeDB()
      // In a real app, we would fetch actual data from IndexedDB
      // For now, we'll use mock data
      setStats({
        totalProducts: 156,
        lowStock: 3,
        totalSales: 24,
        pendingPayments: 7,
      })
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
    await loadData()
  }

  const StatCard = ({ title, value, icon: Icon, description, trend, color }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend ? (
              <div className={`flex items-center text-xs ${trend.color}`}>
                <TrendingUp className="mr-1 h-3 w-3" />
                <span>{trend.text}</span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
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
          disabled={isLoading || isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
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
          trend={{ text: "+12% from yesterday", color: "text-green-500" }}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={Users}
          description="2 due this week"
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
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">iPhone 13 Pro</p>
                    <p className="text-sm text-muted-foreground">IMEI: 352789102345678</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₱65,990</p>
                    <p className="text-sm text-muted-foreground">Today, 10:23 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Samsung Galaxy Buds</p>
                    <p className="text-sm text-muted-foreground">SN: BUD78901234</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₱7,990</p>
                    <p className="text-sm text-muted-foreground">Today, 9:45 AM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">JBL Flip 5</p>
                    <p className="text-sm text-muted-foreground">SN: JBL5678901</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₱5,490</p>
                    <p className="text-sm text-muted-foreground">Yesterday, 4:30 PM</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
            <CardDescription>Installment payments due soon</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Maria Santos</p>
                    <p className="text-sm text-muted-foreground">iPhone 12 - 2nd payment</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₱10,000</p>
                    <p className="text-sm text-destructive">Due in 2 days</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Juan Dela Cruz</p>
                    <p className="text-sm text-muted-foreground">MacBook Air - 3rd payment</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₱15,000</p>
                    <p className="text-sm text-amber-500">Due in 5 days</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ana Reyes</p>
                    <p className="text-sm text-muted-foreground">Samsung TV - Final payment</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₱8,500</p>
                    <p className="text-sm text-muted-foreground">Due in 10 days</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
