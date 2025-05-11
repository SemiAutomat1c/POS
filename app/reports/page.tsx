"use client"

import { useState, useEffect } from "react"
import { Calendar, Download, Filter, BarChart3, PieChart, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { initializeDB } from "@/lib/db"
import SalesChart from "@/components/reports/sales-chart"
import ProductsChart from "@/components/reports/products-chart"
import InventoryChart from "@/components/reports/inventory-chart"

export default function ReportsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB()
        // In a real app, we would fetch actual data from IndexedDB
      } catch (error) {
        console.error("Failed to load report data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analyze your business performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs defaultValue="sales" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="sales">
                <BarChart3 className="mr-2 h-4 w-4" />
                Sales
              </TabsTrigger>
              <TabsTrigger value="products">
                <PieChart className="mr-2 h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="inventory">
                <LineChart className="mr-2 h-4 w-4" />
                Inventory
              </TabsTrigger>
            </TabsList>
            <Select defaultValue={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱245,500.00</div>
                  <p className="text-xs text-muted-foreground">+12.5% from previous {period}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+8.2% from previous {period}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱10,229.17</div>
                  <p className="text-xs text-muted-foreground">+4.3% from previous {period}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
                <CardDescription>Sales performance for the current {period}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <SalesChart period={period} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">iPhone 13 Pro</div>
                  <p className="text-xs text-muted-foreground">5 units sold this {period}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Phones</div>
                  <p className="text-xs text-muted-foreground">12 units sold this {period}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24.5%</div>
                  <p className="text-xs text-muted-foreground">+2.1% from previous {period}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Product Performance</CardTitle>
                <CardDescription>Top selling products for the current {period}</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ProductsChart period={period} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₱1,245,780.00</div>
                  <p className="text-xs text-muted-foreground">156 products in inventory</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-500">12</div>
                  <p className="text-xs text-muted-foreground">Need reordering soon</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2x</div>
                  <p className="text-xs text-muted-foreground">Average inventory turnover this {period}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Current inventory levels by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <InventoryChart period={period} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
