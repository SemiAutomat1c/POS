"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Search, Filter, Download, Upload, Trash2 } from "lucide-react"
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
import { fetchProducts, createProduct, modifyProduct, removeProduct } from "@/store/slices/productSlice"
import { checkLowStockItems } from "@/store/slices/notificationSlice"
import type { Product, ProductWithVariants, ProductVariantOption } from "@/lib/models/Product"
import type { Product as LegacyProduct } from "@/types"
import { toast } from "sonner"
import AddProductWithVariantsDialog from "@/components/add-product-with-variants-dialog"

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
  const searchParams = useSearchParams()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<LegacyProduct | null>(null)
  const [activeFilter, setActiveFilter] = useState("all")
  const [addedCount, setAddedCount] = useState(0)

  // Check if we should show the add dialog based on URL parameters
  useEffect(() => {
    if (searchParams) {
      const action = searchParams.get('action')
      if (action === 'add-product' || action === 'add-variants') {
        setShowAddDialog(true)
      }
    }
  }, [searchParams])

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

  // Add an effect to log when products change
  useEffect(() => {
    console.log("Products state updated:", products);
  }, [products]);
  
  // Update the listKey to include the addedCount
  const listKey = `products-${products.length}-${addedCount}-${Date.now()}`;

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
    // Check for required fields
    if (!newProductData.name) {
      toast.error("Product name is required");
      return;
    }
    
    if (typeof newProductData.price !== 'number' || newProductData.price < 0) {
      toast.error("Valid product price is required");
      return;
    }

    // Check if this is a product with variants
    const hasVariants = newProductData.variants && newProductData.variants.length > 0;
    
    console.log("Product with variants?", hasVariants, newProductData);

    if (hasVariants) {
      // This is a product with variants, preserve all the variant-related data
      const baseProduct = {
        name: newProductData.name || '',
        price: newProductData.price || 0,
        quantity: 0, // Base products don't have their own quantity
        minStockLevel: newProductData.lowStockThreshold || 5,
        description: newProductData.description || '',
        sku: newProductData.sku || null,
        barcode: newProductData.barcode || null,
        cost: newProductData.cost || 0,
        brand: newProductData.brand || null,
        color: newProductData.color || null,
        storage: newProductData.storage || null,
        condition: newProductData.condition || 'new',
        isBaseProduct: true,
        variantOptions: newProductData.variantOptions || [],
        // Add timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("Adding base product with variants:", baseProduct);
      
      // First create the base product
      dispatch(createProduct(baseProduct))
        .unwrap()
        .then((createdBaseProduct) => {
          console.log("Base product created:", createdBaseProduct);
          
          // Now create all variants
          const variantPromises = newProductData.variants.map((variant: any) => {
            const variantProduct = {
              name: variant.name || `${newProductData.name} - ${variant.variantValue}`,
              price: variant.price || newProductData.price,
              quantity: variant.quantity || 0,
              minStockLevel: newProductData.lowStockThreshold || 5,
              description: newProductData.description || '',
              sku: variant.sku || null,
              barcode: variant.barcode || null,
              cost: variant.cost || newProductData.cost || 0,
              brand: newProductData.brand || null,
              color: variant.color || null,
              storage: variant.storage || null,
              condition: newProductData.condition || 'new',
              isBaseProduct: false,
              baseProductId: createdBaseProduct.id,
              variantType: variant.variantType || '',
              variantValue: variant.variantValue || '',
              variantName: variant.variantName || '',
              // Add timestamps
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            return dispatch(createProduct(variantProduct)).unwrap();
          });
          
          Promise.all(variantPromises)
            .then(() => {
              console.log("All variants created");
              dispatch(fetchProducts());
              dispatch(checkLowStockItems());
              setAddedCount(prev => prev + 1);
              toast.success(`${newProductData.name} and ${newProductData.variants.length} variants added to inventory`);
            })
            .catch(error => {
              console.error("Failed to add variants:", error);
              toast.error(`Base product created but failed to add variants: ${error.message || "Unknown error"}`);
            });
        })
        .catch((error) => {
          console.error("Failed to add base product:", error);
          toast.error(`Failed to add product: ${error.message || "Unknown error"}`);
        });
    } else {
      // Regular product without variants
      const newProduct = {
        name: newProductData.name || '',
        price: newProductData.price || 0,
        quantity: newProductData.stock || 0,
        minStockLevel: newProductData.lowStockThreshold || 5,
        description: newProductData.description || '',
        sku: newProductData.sku || null,
        barcode: newProductData.barcode || null,
        cost: newProductData.costPrice || 0,
        brand: newProductData.vendor || null,
        model: newProductData.model || null,
        // Handle serial number correctly - use null for empty strings
        serialNumber: newProductData.serialNumber && newProductData.serialNumber.trim() !== '' 
          ? newProductData.serialNumber 
          : null,
        status: (newProductData.stock === 0 ? 'out_of_stock' : 'active') as 'out_of_stock' | 'active',
        color: newProductData.color || null,
        storage: newProductData.storage || null,
        condition: newProductData.condition || 'new',
        // Add timestamps
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("Adding regular product:", newProduct);
      
      // Dispatch the create product action and handle the result
      dispatch(createProduct(newProduct))
        .unwrap()
        .then(() => {
          // Product added successfully, now refresh the product list
          console.log("Product added, refreshing list");
          dispatch(fetchProducts());
          
          // Check if this product is low in stock and generate notifications if needed
          console.log("Checking for low stock notifications after adding product");
          dispatch(checkLowStockItems());
          
          // Increment counter to trigger re-render
          setAddedCount(prev => prev + 1);
          
          // Show success message
          toast.success(`${newProduct.name} added to inventory`);
        })
        .catch((error) => {
          console.error("Failed to add product:", error);
          toast.error(`Failed to add product: ${error.message || "Unknown error"}`);
        });
    }
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
    <div className="space-y-6" suppressHydrationWarning>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2" suppressHydrationWarning>
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

      <Card suppressHydrationWarning>
        <CardContent className="p-6" suppressHydrationWarning>
          <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} suppressHydrationWarning>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6" suppressHydrationWarning>
              <TabsList suppressHydrationWarning>
                <TabsTrigger value="all">All Products</TabsTrigger>
                <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
                <TabsTrigger value="phones">Phones</TabsTrigger>
                <TabsTrigger value="accessories">Accessories</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2" suppressHydrationWarning>
                <div className="relative" suppressHydrationWarning>
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" suppressHydrationWarning />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8 w-full sm:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    suppressHydrationWarning
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

            <div className="rounded-md border" key={listKey} suppressHydrationWarning>
              <Table suppressHydrationWarning>
                <TableHeader suppressHydrationWarning>
                  <TableRow suppressHydrationWarning>
                    <TableHead suppressHydrationWarning></TableHead>
                    <TableHead suppressHydrationWarning>Name</TableHead>
                    <TableHead suppressHydrationWarning>SKU</TableHead>
                    <TableHead suppressHydrationWarning>Specs</TableHead>
                    <TableHead suppressHydrationWarning>Stock</TableHead>
                    <TableHead suppressHydrationWarning>Price</TableHead>
                    <TableHead suppressHydrationWarning>Status</TableHead>
                    <TableHead suppressHydrationWarning>Brand</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody suppressHydrationWarning>
                  {isLoading ? (
                    <TableRow suppressHydrationWarning>
                      <TableCell colSpan={8} className="text-center" suppressHydrationWarning>
                        Loading products...
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow suppressHydrationWarning>
                      <TableCell colSpan={8} className="text-center" suppressHydrationWarning>
                        No products found. {products.length > 0 ? 'Try a different search.' : 'Add your first product!'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      // Cast to ProductWithVariants to access variant properties
                      const productWithVariants = product as ProductWithVariants;
                      
                      return (
                        <TableRow
                          key={product.id}
                          onClick={() => selectProduct(product)}
                          className="cursor-pointer"
                          suppressHydrationWarning
                        >
                          <TableCell suppressHydrationWarning>
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center" suppressHydrationWarning>
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  product.name
                                )}&background=random`}
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                                suppressHydrationWarning
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium" suppressHydrationWarning>{product.name}</TableCell>
                          <TableCell suppressHydrationWarning>{product.sku || '-'}</TableCell>
                          <TableCell suppressHydrationWarning>
                            <div className="flex flex-col" suppressHydrationWarning>
                              {product.color && <span className="text-xs text-muted-foreground" suppressHydrationWarning>Color: {product.color}</span>}
                              {product.storage && <span className="text-xs text-muted-foreground" suppressHydrationWarning>Storage: {product.storage}</span>}
                              {product.condition && (
                                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                                  Condition: {product.condition === 'new' ? 'Brand New' : 
                                              product.condition === 'pre-owned' ? 'Pre-Owned' : 'Refurbished'}
                                </span>
                              )}
                              {product.serialNumber && <span className="text-xs text-muted-foreground" suppressHydrationWarning>SN: {product.serialNumber}</span>}
                              
                              {/* Display variant options if this is a base product with variants */}
                              {product.isBaseProduct && (
                                <>
                                  {(product as any).variantOptions?.map((option: {type: string, values: string[]}, index: number) => (
                                    <span key={index} className="text-xs text-muted-foreground mt-1" suppressHydrationWarning>
                                      <span className="font-semibold">{option.type}:</span> {option.values.join(', ')}
                                    </span>
                                  ))}
                                </>
                              )}
                              
                              {/* Show indicator if this is a variant */}
                              {product.baseProductId && !product.isBaseProduct && (
                                <span className="text-xs text-blue-500 mt-1" suppressHydrationWarning>
                                  Variant of #{product.baseProductId}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell suppressHydrationWarning>{product.quantity}</TableCell>
                          <TableCell suppressHydrationWarning>{formatCurrency(product.price)}</TableCell>
                          <TableCell suppressHydrationWarning>{getStockStatusBadge(product)}</TableCell>
                          <TableCell suppressHydrationWarning>{product.brand || '-'}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {showAddDialog && (
        <AddProductWithVariantsDialog 
          open={showAddDialog} 
          onClose={() => {
            console.log("Closing add product dialog");
            // Force a refresh when closing the dialog just to be sure
            dispatch(fetchProducts());
            setShowAddDialog(false);
          }} 
          onAdd={(product) => {
            console.log("Adding product from dialog:", product);
            handleAddProduct(product);
          }} 
        />
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
