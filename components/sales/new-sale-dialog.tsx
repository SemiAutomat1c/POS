"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Trash2, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ReceiptPrinter } from "./receipt-printer"
import { useAppSelector } from "@/store/hooks"
import type { Product } from "@/lib/models/Product"

interface NewSaleDialogProps {
  open: boolean
  onClose: () => void
  onSave: (sale: any) => void
}

interface SaleItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  barcode?: string;
  color?: string;
  storage?: string;
  condition?: 'new' | 'pre-owned' | 'refurbished';
}

export default function NewSaleDialog({ open, onClose, onSave }: NewSaleDialogProps) {
  // Get products from Redux store
  const products = useAppSelector((state) => state.products.items)
  const customers = useAppSelector((state) => state.customers.items)
  
  const [customer, setCustomer] = useState("walk-in")
  const [paymentType, setPaymentType] = useState("")
  const [items, setItems] = useState<SaleItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [completedSale, setCompletedSale] = useState<any>(null)
  const [shouldPrintReceipt, setShouldPrintReceipt] = useState(true)
  const [cashAmount, setCashAmount] = useState<string>("")

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  const addToCart = (product: Product) => {
    const existingItem = items.find(item => item.id === product.id)
    if (existingItem) {
      setItems(items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setItems([...items, {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        barcode: product.barcode,
        color: product.color,
        storage: product.storage,
        condition: product.condition
      }])
    }
  }

  const calculateSubtotal = (item: SaleItem) => {
    return item.price * item.quantity
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0)
  }

  // Calculate change
  const calculateChange = () => {
    const amountGiven = parseFloat(cashAmount) || 0
    return Math.max(0, amountGiven - calculateTotal())
  }

  // Validate if can complete sale
  const canCompleteSale = () => {
    if (!paymentType || items.length === 0) return false
    if (paymentType === "cash") {
      const amountGiven = parseFloat(cashAmount) || 0
      return amountGiven >= calculateTotal()
    }
    return true
  }

  const handleCompleteSale = () => {
    console.log("Starting sale completion...")
    
    const sale = {
      id: `INV-${Date.now()}`,
      date: new Date(),
      customerId: customer === 'walk-in' ? null : customer,
      items: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subtotal: calculateTotal(),
      tax: 0, // No VAT
      total: calculateTotal(), // Total is same as subtotal
      paymentType: paymentType,
      paymentDetails: paymentType === "cash" ? {
        amountGiven: parseFloat(cashAmount),
        change: calculateChange()
      } : undefined
    }

    console.log("Sale object created:", sale)
    setCompletedSale(sale)
    setShowReceipt(true)
    
    setTimeout(() => {
      onSave(sale)
      console.log("Sale saved and receipt should be showing")
    }, 0)
  }

  // Add debug log for render conditions
  console.log("Current state:", { showReceipt, completedSale, items, paymentType })

  if (showReceipt && completedSale) {
    console.log("Showing receipt dialog")
    return (
      <Dialog open={true} onOpenChange={() => {
        console.log("Dialog close requested")
        onClose()
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sale Complete</DialogTitle>
            <DialogDescription>Transaction #{completedSale.id}</DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <ReceiptPrinter 
              sale={completedSale} 
              autoPrint={shouldPrintReceipt}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => {
              console.log("Closing receipt and resetting state")
              setShowReceipt(false)
              setCompletedSale(null)
              setItems([])
              setCustomer("walk-in")
              setPaymentType("")
              setShouldPrintReceipt(true)
              onClose()
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
          <DialogDescription>Record a new sales transaction</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Left Column - Products */}
          <div className="flex flex-col h-full">
            <div className="space-y-4 mb-4">
              <div>
                <Label>Customer</Label>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Products</Label>
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 border rounded-md overflow-hidden flex flex-col min-h-0">
              <div className="grid grid-cols-4 gap-4 p-3 border-b bg-muted/50">
                <div>Product</div>
                <div>Price</div>
                <div>Stock</div>
                <div>Action</div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="grid grid-cols-4 gap-4 p-3 border-b items-center hover:bg-muted/50">
                      <div className="font-medium">
                        {product.name}
                        <div className="text-xs text-muted-foreground">
                          {[
                            product.color && `${product.color}`,
                            product.storage && `${product.storage}`,
                            product.condition && (product.condition === 'new' ? 'Brand New' : 
                                                 product.condition === 'pre-owned' ? 'Pre-Owned' : 'Refurbished')
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                      <div>₱{product.price.toLocaleString()}</div>
                      <div>{product.quantity}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addToCart(product)}
                        disabled={product.quantity === 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-muted-foreground">
                    {products.length === 0 
                      ? "No products in inventory. Add products first." 
                      : "No products match your search."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Cart */}
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <Label>Cart</Label>
            </div>

            <div className="flex-1 border rounded-md overflow-hidden flex flex-col min-h-0">
              <div className="grid grid-cols-4 gap-4 p-3 border-b bg-muted/50">
                <div>Product</div>
                <div>Price</div>
                <div>Qty</div>
                <div>Subtotal</div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Cart is empty
                  </div>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-3 border-b items-center hover:bg-muted/50">
                      <div className="font-medium">
                        {item.name}
                        <div className="text-xs text-muted-foreground">
                          {[
                            item.color && `${item.color}`,
                            item.storage && `${item.storage}`,
                            item.condition && (item.condition === 'new' ? 'Brand New' : 
                                              item.condition === 'pre-owned' ? 'Pre-Owned' : 'Refurbished')
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                      <div>₱{item.price.toLocaleString()}</div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            if (item.quantity === 1) {
                              setItems(items.filter((_, i) => i !== index))
                            } else {
                              setItems(items.map((i, idx) =>
                                idx === index ? { ...i, quantity: i.quantity - 1 } : i
                              ))
                            }
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        {item.quantity}
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setItems(items.map((i, idx) =>
                              idx === index ? { ...i, quantity: i.quantity + 1 } : i
                            ))
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>₱{calculateSubtotal(item).toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment section */}
            <div className="mt-4 space-y-4 bg-muted/50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Subtotal:</span>
                  <span>₱{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₱{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Payment Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={paymentType === "cash" ? "default" : "outline"}
                    onClick={() => {
                      setPaymentType("cash")
                      setCashAmount("")
                    }}
                  >
                    Cash
                  </Button>
                  <Button
                    variant={paymentType === "card" ? "default" : "outline"}
                    onClick={() => {
                      setPaymentType("card")
                      setCashAmount("")
                    }}
                  >
                    Card
                  </Button>
                  <Button
                    variant={paymentType === "gcash" ? "default" : "outline"}
                    onClick={() => {
                      setPaymentType("gcash")
                      setCashAmount("")
                    }}
                  >
                    GCash
                  </Button>
                </div>
              </div>

              {paymentType === "cash" && (
                <div className="space-y-4 rounded-lg border bg-background p-4">
                  <div className="space-y-2">
                    <Label htmlFor="cash-amount">Amount Given</Label>
                    <Input
                      id="cash-amount"
                      type="number"
                      min={calculateTotal()}
                      step="0.01"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Enter amount"
                    />
                  </div>
                  
                  {parseFloat(cashAmount) > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Amount Given:</span>
                        <span>₱{parseFloat(cashAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Change:</span>
                        <span>₱{calculateChange().toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="print-receipt"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={shouldPrintReceipt}
                  onChange={(e) => setShouldPrintReceipt(e.target.checked)}
                />
                <Label htmlFor="print-receipt">Print receipt after sale</Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCompleteSale}
            disabled={!canCompleteSale()}
          >
            Complete Sale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
