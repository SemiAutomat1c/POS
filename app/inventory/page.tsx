"use client"

import { useState, useEffect } from "react"
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
import { initializeDB } from "@/lib/db"
import { ProductDetails } from "@/components/product-details"
import AddProductDialog from "@/components/add-product-dialog"
import { formatCurrency } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProducts, createProduct } from "@/store/slices/productSlice"
import type { Product } from "@/lib/models/Product"
import type { Product as LegacyProduct } from "@/types"

// For compatibility with the existing component props
interface ProductViewData extends Product {
  category?: string; 
  vendor?: string;
  lowStockThreshold?: number;
  stock?: number;
}

// Adapter function to convert our Redux Product to the legacy Product type expected by components
function adaptProductForLegacyComponents(product: Product): LegacyProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.categoryId ? `Category ${product.categoryId}` : 'Uncategorized',
    serialNumber: product.serialNumber || '',
    stock: product.quantity,
    price: product.price,
    costPrice: product.cost,
    lowStockThreshold: product.minStockLevel || 5,
    vendor: product.brand || '',
    status: product.quantity === 0 
      ? 'out-of-stock' 
      : (product.quantity <= (product.minStockLevel || 5) ? 'low-stock' : 'in-stock'),
    createdAt: product.createdAt || new Date(),
    updatedAt: product.updatedAt || new Date(),
    color: product.color || '',
    storage: product.storage || '',
    condition: product.condition || 'new'
  };
}

export default function InventoryPage() {
  const dispatch = useAppDispatch()
  const { items: products, status } = useAppSelector((state) => state.products)
  const isLoading = status === 'loading'
  
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<LegacyProduct | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB()
        dispatch(fetchProducts())
      } catch (error) {
        console.error("Failed to load products:", error)
      }
    }

    loadData()
  }, [dispatch])

  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      product.name.toLowerCase().includes(searchLower) ||
      (product.brand?.toLowerCase().includes(searchLower) || false) ||
      (product.model?.toLowerCase().includes(searchLower) || false) ||
      (product.sku?.toLowerCase().includes(searchLower) || false) ||
      (product.serialNumber?.toLowerCase().includes(searchLower) || false)

    if (activeFilter === "all") return matchesSearch
    if (activeFilter === "low-stock") return matchesSearch && product.quantity <= (product.minStockLevel || 5)
    if (activeFilter === "out-of-stock") return matchesSearch && product.quantity === 0
    // Since we don't have categories in our new model, this filter won't work as before
    return matchesSearch
  })

  const handleAddProduct = (newProductData: any) => {
    // Convert the product data to match our Product interface
    const newProduct = {
      name: newProductData.name || '',
      price: newProductData.price || 0,
      quantity: newProductData.stock || 0,
      minStockLevel: newProductData.lowStockThreshold,
      description: newProductData.description,
      sku: newProductData.sku,
      barcode: newProductData.barcode,
      cost: newProductData.costPrice,
      brand: newProductData.vendor,
      model: newProductData.model,
      serialNumber: newProductData.serialNumber,
      status: (newProductData.stock === 0 ? 'out_of_stock' : 'active') as 'out_of_stock' | 'active',
      color: newProductData.color,
      storage: newProductData.storage,
      condition: newProductData.condition
    };
    
    // Dispatch the create product action
    dispatch(createProduct(newProduct));
    setShowAddDialog(false);
  }

  const getStockStatusBadge = (product: Product) => {
    if (product.quantity === 0) {
      return <Badge className="bg-red-500/10 text-red-500">Out of Stock</Badge>
    } else if (product.quantity <= (product.minStockLevel || 5)) {
      return <Badge className="bg-yellow-500/10 text-yellow-500">Low Stock</Badge>
    } else {
      return <Badge className="bg-green-500/10 text-green-500">In Stock</Badge>
    }
  }

  const selectProduct = (product: Product) => {
    setSelectedProduct(adaptProductForLegacyComponents(product));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
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

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
                <TabsTrigger value="phones">Phones</TabsTrigger>
                <TabsTrigger value="accessories">Accessories</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Sort by Name</DropdownMenuItem>
                    <DropdownMenuItem>Sort by Stock</DropdownMenuItem>
                    <DropdownMenuItem>Sort by Price</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Filter by Vendor</DropdownMenuItem>
                    <DropdownMenuItem>Filter by Category</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Specs</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Brand</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No products found. {products.length > 0 ? 'Try a different search.' : 'Add your first product!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        onClick={() => selectProduct(product)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                product.name
                              )}&background=random`}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.sku || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            {product.color && <span className="text-xs text-muted-foreground">Color: {product.color}</span>}
                            {product.storage && <span className="text-xs text-muted-foreground">Storage: {product.storage}</span>}
                            {product.condition && (
                              <span className="text-xs text-muted-foreground">
                                Condition: {product.condition === 'new' ? 'Brand New' : 
                                            product.condition === 'pre-owned' ? 'Pre-Owned' : 'Refurbished'}
                              </span>
                            )}
                            {product.serialNumber && <span className="text-xs text-muted-foreground">SN: {product.serialNumber}</span>}
                          </div>
                        </TableCell>
                        <TableCell>{product.quantity}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{getStockStatusBadge(product)}</TableCell>
                        <TableCell>{product.brand || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddProductDialog open={showAddDialog} onClose={() => setShowAddDialog(false)} onAdd={handleAddProduct} />
      )}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
