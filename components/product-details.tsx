"use client"

import React from "react"
import { useState } from "react"
import { Product, StockMovement } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Package,
  Truck,
  History,
  BarChart,
  AlertTriangle,
  Plus,
  Minus,
  Settings,
  Barcode,
  InfoIcon,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProductDetailsProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

interface SerialItem {
  serialNumber: string
  barcode: string
}

export function ProductDetails({ product, isOpen, onClose }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [stockMovements] = useState<StockMovement[]>([
    {
      id: 1,
      productId: product.id,
      type: "in",
      quantity: 10,
      reason: "Restocking",
      date: new Date("2024-03-15"),
      userId: 1,
    },
    {
      id: 2,
      productId: product.id,
      type: "out",
      quantity: 2,
      reason: "Sale",
      reference: "INV-001",
      date: new Date("2024-03-16"),
      userId: 1,
    },
  ])

  // Check if product has serialized items
  const hasMultipleSerials = product.specifications && 
                          typeof product.specifications === 'object' &&
                          'serialItems' in product.specifications && 
                          typeof product.specifications.serialItems === 'string';
  
  // Parse the serial items
  const serialItems: SerialItem[] = hasMultipleSerials && product.specifications
    ? JSON.parse(product.specifications.serialItems as string)
    : [];

  // Check if a serial number is a generated placeholder (starts with PO-)
  const isPlaceholderSerial = (serial: string) => {
    return serial && serial.startsWith("PO-");
  };

  // Determine the type of serial number for display
  const getSerialBadgeType = (serial: string) => {
    if (!serial) return "none";
    if (isPlaceholderSerial(serial)) return "placeholder";
    return "original";
  };

  const getStockStatusColor = (status: Product["status"]) => {
    switch (status) {
      case "in-stock":
        return "bg-green-500/10 text-green-500"
      case "low-stock":
        return "bg-yellow-500/10 text-yellow-500"
      case "out-of-stock":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  // Get badge color for serial type
  const getSerialBadgeColor = (type: string) => {
    switch (type) {
      case "original":
        return "bg-blue-500/10 text-blue-500"
      case "placeholder":
        return "bg-amber-500/10 text-amber-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
          <DialogDescription>View and manage product information</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stock">Stock</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Basic Info</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="text-sm">{product.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                      <dd className="text-sm">{product.category}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1">
                        <span className="text-sm font-medium text-muted-foreground">Serial/IMEI</span>
                        {product.serialNumber && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge className={getSerialBadgeColor(getSerialBadgeType(product.serialNumber))}>
                                  {getSerialBadgeType(product.serialNumber) === "placeholder" ? "Store ID" : "Original"}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                {getSerialBadgeType(product.serialNumber) === "placeholder" 
                                ? "This is a store-generated identifier" 
                                : "Original manufacturer serial number"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </dt>
                      <dd className="text-sm break-all">
                        {product.serialNumber || (hasMultipleSerials ? "Multiple (see below)" : "—")}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Vendor</dt>
                      <dd className="text-sm">{product.vendor}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Product Specifications</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    {product.color && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Color</dt>
                        <dd className="text-sm">{product.color}</dd>
                      </div>
                    )}
                    {product.storage && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Storage</dt>
                        <dd className="text-sm">{product.storage}</dd>
                      </div>
                    )}
                    {product.condition && (
                      <div>
                        <dt className="text-sm font-medium text-muted-foreground">Condition</dt>
                        <dd className="text-sm">
                          {product.condition === 'new' ? 'Brand New' : 
                           product.condition === 'pre-owned' ? 'Pre-Owned' : 'Refurbished'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stock Info</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Current Stock</dt>
                      <dd className="text-sm flex items-center gap-2">
                        {product.stock}
                        <Badge variant="secondary" className={getStockStatusColor(product.status)}>
                          {product.status.replace("-", " ")}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Low Stock Threshold</dt>
                      <dd className="text-sm">{product.lowStockThreshold}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Last Restocked</dt>
                      <dd className="text-sm">
                        {product.lastRestocked
                          ? new Date(product.lastRestocked).toLocaleDateString()
                          : "N/A"}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pricing</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">Selling Price</dt>
                      <dd className="text-sm font-medium">{formatCurrency(product.price)}</dd>
                    </div>
                    {product.costPrice && (
                      <div className="flex items-center justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Cost Price</dt>
                        <dd className="text-sm">{formatCurrency(product.costPrice)}</dd>
                      </div>
                    )}
                    {product.costPrice && (
                      <div className="flex items-center justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">Profit Margin</dt>
                        <dd className="text-sm text-green-500">
                          {(((product.price - product.costPrice) / product.costPrice) * 100).toFixed(2)}%
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </div>

            {hasMultipleSerials && serialItems.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">Serial Numbers & Barcodes</CardTitle>
                    {product.condition !== 'new' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="w-64">
                              Some items may use store-generated identifiers (PO-prefix) if the original
                              serial numbers were not available for pre-owned or refurbished items.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  <Barcode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-40 w-full rounded-md border">
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 p-4">
                      <div className="font-medium text-sm">Serial/IMEI</div>
                      <div className="font-medium text-sm">Barcode</div>
                      <div className="font-medium text-sm">Type</div>
                      {serialItems.map((item, index) => (
                        <React.Fragment key={`serial-item-${index}`}>
                          <div className="text-sm break-all">{item.serialNumber || "—"}</div>
                          <div className="text-sm break-all">{item.barcode || "—"}</div>
                          <div>
                            {item.serialNumber && (
                              <Badge className={getSerialBadgeColor(getSerialBadgeType(item.serialNumber))}>
                                {getSerialBadgeType(item.serialNumber) === "placeholder" ? "Store ID" : "Original"}
                              </Badge>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stock" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock Management</CardTitle>
                <CardDescription>Adjust stock levels and view movements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stock
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Minus className="mr-2 h-4 w-4" />
                    Remove Stock
                  </Button>
                </div>

                <div className="rounded-md border">
                  <div className="p-4">
                    <h4 className="text-sm font-medium">Recent Stock Movements</h4>
                  </div>
                  <div className="border-t">
                    {stockMovements.map((movement) => (
                      <div key={movement.id} className="flex items-center p-4 border-b last:border-b-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {movement.type === "in" ? (
                              <Badge className="bg-green-500/10 text-green-500">In</Badge>
                            ) : (
                              <Badge className="bg-blue-500/10 text-blue-500">Out</Badge>
                            )}
                            <span className="font-medium">{movement.quantity} units</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{movement.reason}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product History</CardTitle>
                <CardDescription>View all activities related to this product</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <History className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Stock Updated</p>
                      <p className="text-sm text-muted-foreground">
                        Added 10 units to inventory
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">2 days ago</p>
                  </div>
                  <div className="flex items-center gap-4 pb-4 border-b">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">New Shipment Received</p>
                      <p className="text-sm text-muted-foreground">
                        Received shipment from {product.vendor}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">5 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Settings</CardTitle>
                <CardDescription>Configure product details and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Product Details
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Adjust Stock Threshold
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 