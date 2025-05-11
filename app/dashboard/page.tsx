"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, ShoppingCart, Tag, Truck, BarChart } from "lucide-react"
import { useRouter } from "next/navigation"
import AddProductWithVariantsDialog from "@/components/add-product-with-variants-dialog"
import { ProductWithVariants } from "@/lib/models/Product"

export default function DashboardPage() {
  const router = useRouter();
  // Mock data - replace with actual data from your backend later
  const totalSales = 15000
  const salesIncrease = 2500
  const totalRevenue = 25000
  const revenueIncrease = 4000
  const totalExpenses = 8000
  const expensesIncrease = 1000
  const lowStockItems = 5
  const outOfStockItems = 2

  // State for add product dialog
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);

  // Handler for adding a product (this is just a placeholder as we'll navigate to inventory)
  const handleAddProduct = (product: ProductWithVariants) => {
    // This would typically add the product and then refresh data
    setShowAddProductDialog(false);
    // Navigate to inventory after adding
    router.push("/inventory");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">+{formatCurrency(salesIncrease)} from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+{formatCurrency(revenueIncrease)} from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">+{formatCurrency(expensesIncrease)} from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">{outOfStockItems} items out of stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="hover:bg-accent/10 cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Add Product</CardTitle>
              <CardDescription>Add a new product to inventory</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <Package className="h-10 w-10 text-primary/60" />
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => setShowAddProductDialog(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:bg-accent/10 cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Product with Variants</CardTitle>
              <CardDescription>Manage product variations</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <Tag className="h-10 w-10 text-primary/60" />
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => {
                setShowAddProductDialog(true);
              }}>
                <Plus className="mr-2 h-4 w-4" /> Create Variants
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:bg-accent/10 cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Sale</CardTitle>
              <CardDescription>Start a new point of sale transaction</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <ShoppingCart className="h-10 w-10 text-primary/60" />
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => router.push("/sales")}>
                Start Sale
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:bg-accent/10 cursor-pointer transition-colors">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inventory Management</CardTitle>
              <CardDescription>Check and update stock levels</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <Truck className="h-10 w-10 text-primary/60" />
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => router.push("/inventory")}>
                Manage Inventory
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Add products dialog */}
      {showAddProductDialog && (
        <AddProductWithVariantsDialog
          open={showAddProductDialog}
          onClose={() => setShowAddProductDialog(false)}
          onAdd={handleAddProduct}
        />
      )}
    </div>
  )
} 