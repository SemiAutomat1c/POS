"use client"

import { useState } from "react"
import { Receipt } from "@/components/receipt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Plus, Minus, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  barcode: string
}

const sampleProducts = [
  {
    id: "1",
    name: "Smartphone X",
    price: 999.99,
    barcode: "SP123456789",
  },
  {
    id: "2",
    name: "Laptop Pro",
    price: 1499.99,
    barcode: "LP987654321",
  },
  {
    id: "3",
    name: "Wireless Earbuds",
    price: 149.99,
    barcode: "WE456789123",
  },
]

export default function TransactionPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [transactionId, setTransactionId] = useState("")

  const addToCart = (product: typeof sampleProducts[0]) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleCheckout = () => {
    if (!cart.length || !paymentMethod) return

    // Generate a transaction ID (in a real app, this would come from the backend)
    const newTransactionId = `TRX-${Date.now()}`
    setTransactionId(newTransactionId)
    setShowReceipt(true)
  }

  const handleNewTransaction = () => {
    setCart([])
    setCustomerName("")
    setPaymentMethod("")
    setShowReceipt(false)
    setTransactionId("")
  }

  if (showReceipt) {
    return (
      <div className="container mx-auto py-8">
        <Receipt
          transactionId={transactionId}
          date={new Date()}
          items={cart}
          total={calculateTotal()}
          paymentMethod={paymentMethod}
          customerName={customerName || undefined}
        />
        <Button
          className="mt-4 w-[300px]"
          variant="outline"
          onClick={handleNewTransaction}
        >
          New Transaction
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Click on a product to add it to cart</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {sampleProducts.map((product) => (
              <Button
                key={product.id}
                variant="outline"
                className="w-full justify-between"
                onClick={() => addToCart(product)}
              >
                <span>{product.name}</span>
                <span>{formatCurrency(product.price)}</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Cart */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Cart</CardTitle>
              <CardDescription>
                {cart.length} items - Total: {formatCurrency(calculateTotal())}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="grid gap-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer Name (Optional)</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payment">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value)}
                >
                  <SelectTrigger id="payment">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="debit">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                disabled={!cart.length || !paymentMethod}
                onClick={handleCheckout}
              >
                Complete Transaction
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 