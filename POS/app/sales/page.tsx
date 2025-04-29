"use client"

import { useState, useEffect } from "react"
import { Search, Filter, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { initializeDB } from "@/lib/db"
import NewSaleDialog from "@/components/sales/new-sale-dialog"

export default function SalesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [sales, setSales] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewSaleDialog, setShowNewSaleDialog] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB()
        // In a real app, we would fetch actual data from IndexedDB
        // For now, we'll use mock data
        const mockSales = [
          {
            id: "S-001",
            date: "2023-04-25",
            customer: "Maria Santos",
            items: [{ name: "iPhone 13 Pro", quantity: 1, price: 65990 }],
            total: 65990,
            paymentType: "GCash",
            status: "Completed",
          },
          {
            id: "S-002",
            date: "2023-04-24",
            customer: "Juan Dela Cruz",
            items: [
              { name: "MacBook Air", quantity: 1, price: 75000 },
              { name: "AppleCare+", quantity: 1, price: 12000 },
            ],
            total: 87000,
            paymentType: "Card",
            status: "Completed",
          },
          {
            id: "S-003",
            date: "2023-04-23",
            customer: "Ana Reyes",
            items: [
              { name: "Samsung TV", quantity: 1, price: 42500 },
              { name: "HDMI Cable", quantity: 2, price: 1500 },
            ],
            total: 45500,
            paymentType: "Installment",
            status: "Completed",
          },
          {
            id: "S-004",
            date: "2023-04-22",
            customer: "Pedro Lim",
            items: [
              { name: "Samsung Galaxy S21", quantity: 1, price: 49990 },
              { name: "Screen Protector", quantity: 1, price: 990 },
              { name: "Phone Case", quantity: 1, price: 1500 },
            ],
            total: 52480,
            paymentType: "Cash",
            status: "Completed",
          },
          {
            id: "S-005",
            date: "2023-04-21",
            customer: "Sofia Garcia",
            items: [
              { name: "iPad Pro", quantity: 1, price: 45000 },
              { name: "Apple Pencil", quantity: 1, price: 7500 },
            ],
            total: 52500,
            paymentType: "Card",
            status: "Completed",
          },
        ]
        setSales(mockSales)
      } catch (error) {
        console.error("Failed to load sales:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredSales = sales.filter(
    (sale) =>
      sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.items.some((item: any) => item.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleNewSale = (sale: any) => {
    console.log("New sale received:", sale)
    // Add the sale to the list with proper ID and date formatting
    setSales([
      {
        id: sale.id,
        date: sale.date.toISOString().split("T")[0],
        customer: sale.customer,
        items: sale.items,
        total: sale.total,
        paymentType: sale.paymentType,
        status: "Completed"
      },
      ...sales
    ])
    setShowNewSaleDialog(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Record and manage sales transactions</p>
        </div>
        <Button onClick={() => setShowNewSaleDialog(true)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Sales History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sales</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="installment">Installment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sales..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading sales...
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No sales found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>{sale.customer}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {sale.items.map((item: any, index: number) => (
                            <div key={index}>
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>₱{sale.total.toLocaleString()}</TableCell>
                      <TableCell>{sale.paymentType}</TableCell>
                      <TableCell>{sale.status}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showNewSaleDialog && (
        <NewSaleDialog 
          open={showNewSaleDialog} 
          onClose={() => setShowNewSaleDialog(false)} 
          onSave={handleNewSale} 
        />
      )}
    </div>
  )
}
