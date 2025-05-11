"use client"

import { useState, useEffect } from "react"
import { Plus, Minus, Trash2, Scan, Barcode } from "lucide-react"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { ReceiptPrinter } from "./receipt-printer"
import { useAppSelector, useAppDispatch } from "@/store/hooks"
import type { Product } from "@/lib/models/Product"
import { Badge } from "@/components/ui/badge"
import React from "react"
import { 
  fetchNotifications, 
  markAllAsRead,
  markAsRead,
  checkLowStockItems 
} from "@/store/slices/notificationSlice";

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
  serialNumber?: string;
}

interface SerialItem {
  serialNumber: string;
  barcode: string;
}

export default function NewSaleDialog({ open, onClose, onSave }: NewSaleDialogProps) {
  // Get products from Redux store
  const products = useAppSelector((state) => state.products.items)
  const customers = useAppSelector((state) => state.customers.items)
  const dispatch = useAppDispatch()
  
  const [customer, setCustomer] = useState("walk-in")
  const [paymentType, setPaymentType] = useState("")
  const [items, setItems] = useState<SaleItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [completedSale, setCompletedSale] = useState<any>(null)
  const [shouldPrintReceipt, setShouldPrintReceipt] = useState(true)
  const [cashAmount, setCashAmount] = useState<string>("")
  const [serialSelectionOpen, setSerialSelectionOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [selectedSerial, setSelectedSerial] = useState<string>("")
  // Add state for sale confirmation dialog
  const [saleConfirmOpen, setSaleConfirmOpen] = useState(false)
  const [pendingSale, setPendingSale] = useState<any>(null)

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  // Check if a product has multiple serial numbers
  const hasMultipleSerials = (product: Product) => {
    return product.specifications && 
           typeof product.specifications === 'object' &&
           'serialItems' in product.specifications && 
           typeof product.specifications.serialItems === 'string';
  }

  // Get serial numbers for a product
  const getSerialItems = (product: Product): SerialItem[] => {
    if (hasMultipleSerials(product) && product.specifications) {
      try {
        return JSON.parse(product.specifications.serialItems as string);
      } catch (e) {
        console.error("Error parsing serial items:", e);
        return [];
      }
    }
    return [];
  }

  // Check if a serial number is a generated placeholder (starts with PO-)
  const isPlaceholderSerial = (serial: string) => {
    return serial && serial.startsWith("PO-");
  };

  // Get display text for a serial number
  const getSerialDisplay = (serial: string) => {
    if (!serial) return "—";
    if (isPlaceholderSerial(serial)) {
      return `${serial} (Store ID)`;
    }
    return serial;
  };

  const addToCart = (product: Product) => {
    // If product has multiple serials, open the serial selection dialog
    if (hasMultipleSerials(product)) {
      setCurrentProduct(product);
      setSerialSelectionOpen(true);
      return;
    }

    // Otherwise add directly to cart
    addProductToCart(product);
  }

  const addProductToCart = (product: Product, serialNumber?: string) => {
    // Get current product from the store to ensure we have latest stock quantity
    const currentProduct = products.find(p => p.id === product.id);
    if (!currentProduct) return;
    
    // Check product inventory
    if (currentProduct.quantity <= 0) {
      toast.error(`${currentProduct.name} is out of stock.`);
      return;
    }
    
    const existingItem = items.find(item => 
      item.id === product.id && 
      (serialNumber ? item.serialNumber === serialNumber : true)
    );

    // Calculate total quantity of this product already in cart
    const productInCartQuantity = items
      .filter(item => item.id === product.id)
      .reduce((total, item) => total + item.quantity, 0);
      
    // Check if adding more would exceed available inventory
    if (existingItem && !serialNumber) {
      // For non-serialized items, check if incrementing would exceed stock
      if (productInCartQuantity + 1 > currentProduct.quantity) {
        toast.error(`Cannot add more ${currentProduct.name}. Only ${currentProduct.quantity} in stock.`);
        return;
      }
      
      // Only increment quantity for non-serialized items if we have enough stock
      setItems(items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      // For new items, check if adding would exceed stock
      if (productInCartQuantity + 1 > currentProduct.quantity) {
        toast.error(`Cannot add ${currentProduct.name}. Only ${currentProduct.quantity} in stock.`);
        return;
      }
      
      // Add as new item
      setItems([...items, {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
        barcode: product.barcode,
        color: product.color,
        storage: product.storage,
        condition: product.condition,
        serialNumber: serialNumber || product.serialNumber
      }]);
    }
    
    // Reset selection state
    setCurrentProduct(null);
    setSelectedSerial("");
    setSerialSelectionOpen(false);
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

  // Replace the handleCompleteSale function
  const handleCompleteSale = () => {
    console.log("Preparing sale completion...")
    
    const sale = {
      id: `INV-${Date.now()}`,
      date: new Date(),
      customerId: customer === 'walk-in' ? null : customer,
      items: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
        serialNumber: item.serialNumber
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
    // Store the sale details and open confirmation dialog
    setPendingSale(sale)
    setSaleConfirmOpen(true)
  }

  // Add new function to complete the sale after confirmation
  const completeSaleAfterConfirmation = () => {
    console.log("Confirming sale completion...")
    
    setCompletedSale(pendingSale)
    setShowReceipt(true)
    setSaleConfirmOpen(false)
    
    setTimeout(() => {
      onSave(pendingSale)
      console.log("Sale saved and receipt should be showing")
      
      // Check for low stock notifications after sale is completed
      dispatch(checkLowStockItems())
    }, 0)
  }

  // Add debug log for render conditions
  console.log("Current state:", { showReceipt, completedSale, items, paymentType })

  const handleFinish = () => {
    setShowReceipt(false)
    setItems([])
    setPaymentType("")
    setCashAmount("")
    setCustomer("walk-in")
    setCompletedSale(null)
    setShouldPrintReceipt(true)
    onClose()
  }

  if (showReceipt && completedSale) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sale Complete</DialogTitle>
            <DialogDescription>Sale recorded successfully</DialogDescription>
          </DialogHeader>
          
          <ReceiptPrinter sale={completedSale} autoPrint={shouldPrintReceipt} />
          
          <DialogFooter>
            <Button onClick={handleFinish}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
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
                            {hasMultipleSerials(product) && (
                              <span className="ml-1 text-blue-500">
                                <Barcode className="h-3 w-3 inline mr-0.5" />Multiple Serials
                              </span>
                            )}
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
                  ) :
                    <div className="p-6 text-center text-muted-foreground">
                      {products.length === 0 
                        ? "No products in inventory. Add products first." 
                        : "No products match your search."}
                    </div>
                  }
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
                            {item.serialNumber && (
                              <div className="text-blue-500">
                                {isPlaceholderSerial(item.serialNumber) ? (
                                  <div className="flex items-center gap-1">
                                    <span>Store ID: {item.serialNumber.substring(3)}</span>
                                    <Badge variant="outline" className="text-[10px] py-0 px-1 h-4">Generated</Badge>
                                  </div>
                                ) : (
                                  <div>SN: {item.serialNumber}</div>
                                )}
                              </div>
                            )}
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
                              // Only allow incrementing quantity for non-serialized items
                              if (!item.serialNumber) {
                                // Get current product from store to check stock
                                const product = products.find(p => p.id === item.id);
                                if (!product) return;
                                
                                // Calculate total quantity of this product in cart
                                const productInCartQuantity = items
                                  .filter(i => i.id === item.id)
                                  .reduce((total, i) => total + i.quantity, 0);
                                  
                                // Check if adding more would exceed inventory
                                if (productInCartQuantity + 1 > product.quantity) {
                                  toast.error(`Cannot add more ${item.name}. Only ${product.quantity} in stock.`);
                                  return;
                                }
                                
                                setItems(items.map((i, idx) =>
                                  idx === index ? { ...i, quantity: i.quantity + 1 } : i
                                ))
                              }
                            }}
                            disabled={!!item.serialNumber}
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
              <div className="border rounded-md p-4 mt-4 space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-xl">₱{calculateTotal().toLocaleString()}</span>
                </div>

                <div>
                  <Label>Payment Method</Label>
                  <Select value={paymentType} onValueChange={setPaymentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="gcash">GCash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentType === "cash" && (
                  <>
                    <div>
                      <Label>Amount Received</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                      />
                    </div>
                    {parseFloat(cashAmount) > 0 && (
                      <div className="flex justify-between">
                        <span>Change</span>
                        <span>₱{calculateChange().toLocaleString()}</span>
                      </div>
                    )}
                  </>
                )}

                <Button 
                  className="w-full" 
                  onClick={handleCompleteSale}
                  disabled={!canCompleteSale()}
                >
                  Complete Sale
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sale Confirmation Dialog */}
      <AlertDialog open={saleConfirmOpen} onOpenChange={setSaleConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to complete this sale for ₱{pendingSale?.total?.toLocaleString() || calculateTotal().toLocaleString()}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={completeSaleAfterConfirmation}>
              Complete Sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Serial Selection Dialog */}
      {currentProduct && (
        <Dialog open={serialSelectionOpen} onOpenChange={setSerialSelectionOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Serial Number</DialogTitle>
              <DialogDescription>
                This product has multiple units with different serial numbers.
                Please select which one to add to the cart.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto border rounded-md p-2">
                <div className="font-medium text-sm">Serial/IMEI</div>
                <div className="font-medium text-sm">Barcode</div>
                
                {getSerialItems(currentProduct).map((item, index) => (
                  <React.Fragment key={`serial-${index}`}>
                    <div 
                      className={`text-sm p-1 rounded cursor-pointer ${selectedSerial === item.serialNumber ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                      onClick={() => setSelectedSerial(item.serialNumber)}
                    >
                      <div className="flex items-center gap-1">
                        <span className="truncate">{item.serialNumber || "—"}</span>
                        {isPlaceholderSerial(item.serialNumber) && (
                          <Badge variant="outline" className="text-xs">Store ID</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm p-1">{item.barcode || "—"}</div>
                  </React.Fragment>
                ))}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setCurrentProduct(null);
                  setSelectedSerial("");
                  setSerialSelectionOpen(false);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => addProductToCart(currentProduct, selectedSerial)}
                  disabled={!selectedSerial}
                >
                  Add to Cart
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
