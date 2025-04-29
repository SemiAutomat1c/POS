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
import { Product } from "@/types"
import { formatCurrency } from "@/lib/utils"

export default function InventoryPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB()
        // In a real app, we would fetch actual data from IndexedDB
        // For now, we'll use mock data
        const mockProducts = [
          {
            id: 1,
            name: "iPhone 13 Pro",
            category: "Phones",
            serialNumber: "IMEI: 352789102345678",
            stock: 5,
            price: 65990,
            lowStockThreshold: 3,
            vendor: "Apple",
            status: "in-stock" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            costPrice: 55000,
            lastRestocked: new Date("2024-03-15"),
          },
          {
            id: 2,
            name: "Samsung Galaxy S21",
            category: "Phones",
            serialNumber: "IMEI: 490123456789012",
            stock: 8,
            price: 49990,
            lowStockThreshold: 3,
            vendor: "Samsung",
            status: "in-stock" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            costPrice: 42000,
          },
          {
            id: 3,
            name: "JBL Flip 5",
            category: "Speakers",
            serialNumber: "SN: JBL5678901",
            stock: 2,
            price: 5490,
            lowStockThreshold: 5,
            vendor: "JBL",
            status: "low-stock" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 4,
            name: "AirPods Pro",
            category: "Accessories",
            serialNumber: "SN: APP7890123",
            stock: 15,
            price: 14990,
            lowStockThreshold: 5,
            vendor: "Apple",
            status: "in-stock" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 5,
            name: "HP LaserJet Pro",
            category: "Printers",
            serialNumber: "SN: HPLJ1234567",
            stock: 0,
            price: 12990,
            lowStockThreshold: 3,
            vendor: "HP",
            status: "out-of-stock" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 6,
            name: "Samsung Galaxy Buds",
            category: "Accessories",
            serialNumber: "SN: BUD78901234",
            stock: 7,
            price: 7990,
            lowStockThreshold: 5,
            vendor: "Samsung",
            status: "in-stock" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]
        setProducts(mockProducts)
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.vendor.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeFilter === "all") return matchesSearch
    if (activeFilter === "low-stock") return matchesSearch && product.status === "low-stock"
    if (activeFilter === "out-of-stock") return matchesSearch && product.status === "out-of-stock"
    return matchesSearch && product.category.toLowerCase() === activeFilter
  })

  const handleAddProduct = (newProduct: Partial<Product>) => {
    const product: Product = {
      ...newProduct,
      id: products.length + 1,
      stock: newProduct.stock || 0,
      price: newProduct.price || 0,
      lowStockThreshold: newProduct.lowStockThreshold || 5,
      status: newProduct.stock === 0 ? "out-of-stock" : "in-stock",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Product

    setProducts([...products, product])
    setShowAddDialog(false)
  }

  const getStockStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "in-stock":
        return <Badge className="bg-green-500/10 text-green-500">In Stock</Badge>
      case "low-stock":
        return <Badge className="bg-yellow-500/10 text-yellow-500">Low Stock</Badge>
      case "out-of-stock":
        return <Badge className="bg-red-500/10 text-red-500">Out of Stock</Badge>
      default:
        return null
    }
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
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Serial/IMEI</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vendor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow
                        key={product.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="font-mono">{product.serialNumber}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>{getStockStatusBadge(product.status)}</TableCell>
                        <TableCell>{product.vendor}</TableCell>
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
