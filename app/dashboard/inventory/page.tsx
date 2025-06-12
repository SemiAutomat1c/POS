"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Search, Filter, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ProductDetails } from "@/components/product-details"
import AddProductDialog from "@/components/add-product-dialog"
import { formatCurrency } from "@/lib/utils"
import { getProducts, addProduct } from "@/lib/db-adapter"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { supabase } from "@/lib/storage/supabase"
import { hasReachedProductLimit, SubscriptionTier } from "@/lib/subscription"
import FeatureGuard from "@/components/subscription/FeatureGuard"
import type { Product as DBProduct } from "@/lib/models/Product"
import type { Product, UIProduct } from "@/types"

// Helper function to convert database product to UI product
function adaptToUIProduct(dbProduct: DBProduct): UIProduct {
  return {
    id: String(dbProduct.id),
    name: dbProduct.name,
    description: dbProduct.description || '',
    category: dbProduct.categoryId ? `Category ${dbProduct.categoryId}` : 'Uncategorized',
    serialNumber: dbProduct.serialNumber || '',
    stock: dbProduct.quantity,
    price: dbProduct.price,
    costPrice: dbProduct.cost || 0,
    lowStockThreshold: dbProduct.minStockLevel || 5,
    vendor: dbProduct.brand || 'Unknown',
    status: dbProduct.quantity === 0 
      ? 'out-of-stock' 
      : (dbProduct.quantity <= (dbProduct.minStockLevel || 5) ? 'low-stock' : 'in-stock'),
    color: dbProduct.color,
    storage: dbProduct.storage,
    condition: dbProduct.condition,
    createdAt: dbProduct.createdAt || new Date(),
    updatedAt: dbProduct.updatedAt || new Date()
  }
}

// Helper function to convert UI product to DB product
function adaptToDBProduct(uiProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Omit<DBProduct, 'id'> {
  return {
    name: uiProduct.name,
    description: uiProduct.description,
    serialNumber: uiProduct.serialNumber,
    price: uiProduct.price,
    quantity: uiProduct.quantity,
    minStockLevel: uiProduct.minStockLevel,
    cost: uiProduct.cost,
    brand: uiProduct.brand,
    color: uiProduct.color,
    storage: uiProduct.storage,
    condition: uiProduct.condition
  }
}

function InventoryContent() {
  const [products, setProducts] = useState<DBProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<UIProduct | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [userSubscription, setUserSubscription] = useState<{
    subscription_tier: SubscriptionTier
  } | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    loadProducts()
    if (user) {
      fetchUserSubscription()
    }
  }, [user])

  async function fetchUserSubscription() {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserSubscription(data)
    } catch (error) {
      console.error('Error fetching user subscription:', error)
    }
  }

  async function loadProducts() {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = products
    .map(adaptToUIProduct)
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const handleAddProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Check if user has reached their product limit
    if (userSubscription) {
      const tier = userSubscription.subscription_tier
      const productCount = products.length
      
      if (hasReachedProductLimit(tier, productCount)) {
        toast({
          title: "Product Limit Reached",
          description: `You've reached the maximum number of products allowed in your ${tier} plan. Please upgrade to add more products.`,
          variant: "destructive"
        })
        setTimeout(() => {
          router.push('/dashboard/subscription')
        }, 2000)
        return
      }
    }

    try {
      await addProduct(adaptToDBProduct(product))
      await loadProducts()
      setShowAddDialog(false)
      toast({
        title: "Product Added",
        description: "The product has been added successfully."
      })
    } catch (error) {
      console.error('Error adding product:', error)
      toast({
        title: "Error",
        description: "Failed to add the product. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <FeatureGuard feature="inventoryManagement">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inventory</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Print Inventory</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        {userSubscription && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Products: {products.length} / 
              {userSubscription.subscription_tier === 'free' ? '50' : 
               userSubscription.subscription_tier === 'basic' ? '500' : 
               'Unlimited'}
            </p>
          </div>
        )}

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow 
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="font-mono">{product.serialNumber}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        product.status === 'in-stock' 
                          ? 'default'
                          : product.status === 'low-stock'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.updatedAt.toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            isOpen={true}
          />
        )}

        <AddProductDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAddProduct}
        />
      </div>
    </FeatureGuard>
  )
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InventoryContent />
    </Suspense>
  )
} 