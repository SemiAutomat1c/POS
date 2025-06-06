"use client"

import { useState, useEffect } from "react"
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
import type { Product as DBProduct } from "@/lib/models/Product"
import type { Product as UIProduct } from "@/types"

// Helper function to convert database product to UI product
function adaptToUIProduct(dbProduct: DBProduct): UIProduct {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || '',
    category: dbProduct.categoryId ? `Category ${dbProduct.categoryId}` : 'Uncategorized',
    serialNumber: dbProduct.serialNumber || '',
    stock: dbProduct.quantity,
    price: dbProduct.price,
    costPrice: dbProduct.cost,
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

// Helper function to convert UI product to database product
function adaptToDBProduct(uiProduct: Partial<UIProduct>): Omit<DBProduct, 'id'> {
  return {
    name: uiProduct.name || '',
    description: uiProduct.description,
    quantity: uiProduct.stock || 0,
    price: uiProduct.price || 0,
    cost: uiProduct.costPrice,
    minStockLevel: uiProduct.lowStockThreshold || 5,
    brand: uiProduct.vendor,
    status: uiProduct.stock === 0 ? 'out_of_stock' : 'active',
    color: uiProduct.color,
    storage: uiProduct.storage,
    condition: uiProduct.condition,
    serialNumber: uiProduct.serialNumber,
    createdAt: uiProduct.createdAt || new Date(),
    updatedAt: uiProduct.updatedAt || new Date()
  }
}

export default function InventoryPage() {
  const [products, setProducts] = useState<DBProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState<DBProduct | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

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
    return matchesSearch
  })

  const getStockStatusBadge = (product: DBProduct) => {
    if (product.quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (product.quantity <= (product.minStockLevel || 5)) {
      return <Badge variant="destructive" className="bg-yellow-500/10 text-yellow-500">Low Stock</Badge>
    }
    return <Badge variant="outline" className="bg-green-500/10 text-green-500">In Stock</Badge>
  }

  return (
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

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setActiveFilter("all")}>All Products</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("low-stock")}>Low Stock</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveFilter("out-of-stock")}>Out of Stock</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
                      onClick={() => setSelectedProduct(product)}
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
          </CardContent>
        </Card>
      </div>

      {showAddDialog && (
        <AddProductDialog 
          open={showAddDialog} 
          onClose={() => setShowAddDialog(false)} 
          onAdd={async (productData) => {
            try {
              const dbProduct = adaptToDBProduct(productData);
              await addProduct(dbProduct);
              const updatedProducts = await getProducts();
              setProducts(updatedProducts);
              setShowAddDialog(false);
            } catch (error) {
              console.error('Error adding product:', error);
            }
          }} 
        />
      )}

      {selectedProduct && (
        <ProductDetails
          product={adaptToUIProduct(selectedProduct)}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
} 