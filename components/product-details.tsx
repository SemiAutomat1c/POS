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
import type { UIProduct } from "@/types"

export interface ProductDetailsProps {
  product: UIProduct;
  onClose: () => void;
  isOpen?: boolean;
}

interface SerialItem {
  serialNumber: string
  barcode: string
}

export function ProductDetails({ product, onClose, isOpen = true }: ProductDetailsProps) {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Name</h4>
            <p className="text-sm">{product.name}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Description</h4>
            <p className="text-sm">{product.description}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Serial Number</h4>
            <p className="text-sm font-mono">{product.serialNumber}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Category</h4>
            <p className="text-sm">{product.category}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Stock</h4>
            <div className="flex items-center gap-2">
              <p className="text-sm">{product.stock}</p>
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
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Price</h4>
            <p className="text-sm">{formatCurrency(product.price)}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Cost Price</h4>
            <p className="text-sm">{formatCurrency(product.costPrice || 0)}</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Vendor</h4>
            <p className="text-sm">{product.vendor}</p>
          </div>
          {product.color && (
            <div className="space-y-2">
              <h4 className="font-medium">Color</h4>
              <p className="text-sm">{product.color}</p>
            </div>
          )}
          {product.storage && (
            <div className="space-y-2">
              <h4 className="font-medium">Storage</h4>
              <p className="text-sm">{product.storage}</p>
            </div>
          )}
          {product.condition && (
            <div className="space-y-2">
              <h4 className="font-medium">Condition</h4>
              <p className="text-sm">{product.condition}</p>
            </div>
          )}
          <div className="space-y-2">
            <h4 className="font-medium">Last Updated</h4>
            <p className="text-sm">{product.updatedAt.toLocaleDateString()}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 