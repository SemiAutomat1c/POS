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

interface NewSaleDialogProps {
  open: boolean
  onClose: () => void
  onSave: (sale: any) => void
}

interface SaleItem {
  name: string
  quantity: number
  price: number
  barcode?: string
}

interface Product {
  id: string
  name: string
  price: number
  barcode: string
  stock: number
}

// Mock product database - replace with actual database later
const mockProducts: Product[] = [
  { id: "1", name: "Product 1", price: 10.99, barcode: "123456789", stock: 50 },
  { id: "2", name: "Product 2", price: 15.99, barcode: "987654321", stock: 30 },
]

export default function NewSaleDialog({ open, onClose, onSave }: NewSaleDialogProps) {
  const [customer, setCustomer] = useState("")
  const [paymentType, setPaymentType] = useState("")
  const [items, setItems] = useState<SaleItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [completedSale, setCompletedSale] = useState<any>(null)
  const [shouldPrintReceipt, setShouldPrintReceipt] = useState(true)
  const [cashAmount, setCashAmount] = useState<string>("")

  // Filter products based on search query
  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (product: Product) => {
    const existingItem = items.find(item => item.name === product.name)
    if (existingItem) {
      setItems(items.map(item =>
        item.name === product.name
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setItems([...items, {
        name: product.name,
        quantity: 1,
        price: product.price,
        barcode: product.barcode
      }])
    }
  }

  const calculateSubtotal = (item: SaleItem) => {
    return item.price * item.quantity
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0)
  }

  // Calculate total with tax
  const calculateTotalWithTax = () => {
    return calculateTotal() * 1.12
  }

  // Calculate change
  const calculateChange = () => {
    const amountGiven = parseFloat(cashAmount) || 0
    return Math.max(0, amountGiven - calculateTotalWithTax())
  }

  // Validate if can complete sale
  const canCompleteSale = () => {
    if (!paymentType || items.length === 0) return false
    if (paymentType === "cash") {
      const amountGiven = parseFloat(cashAmount) || 0
      return amountGiven >= calculateTotalWithTax()
    }
    return true
  }

  const handleCompleteSale = () => {
    console.log("Starting sale completion...")
    
    const sale = {
      id: `INV-${Date.now()}`,
      date: new Date(),
      customer: customer || "Walk-in Customer",
      items: items.map(item => ({
        ...item,
        total: item.price * item.quantity
      })),
      subtotal: calculateTotal(),
      tax: calculateTotal() * 0.12,
      total: calculateTotalWithTax(),
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
              setCustomer("")
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
                    <SelectItem value="john-doe">John Doe</SelectItem>
                    <SelectItem value="jane-smith">Jane Smith</SelectItem>
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
                {filteredProducts.map((product) => (
                  <div key={product.id} className="grid grid-cols-4 gap-4 p-3 border-b items-center hover:bg-muted/50">
                    <div className="font-medium">{product.name}</div>
                    <div>₱{product.price.toLocaleString()}</div>
                    <div>{product.stock}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                      <div className="font-medium">{item.name}</div>
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
                <div className="flex justify-between text-sm">
                  <span>VAT (12%):</span>
                  <span>₱{(calculateTotal() * 0.12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₱{calculateTotalWithTax().toLocaleString()}</span>
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
                      min={calculateTotalWithTax()}
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
