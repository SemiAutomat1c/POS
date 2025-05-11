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
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchSales, createSale } from "@/store/slices/saleSlice"
import { fetchProducts } from "@/store/slices/productSlice"
import type { Sale, SaleItem } from "@/lib/models/Sale"
import { useToast } from "@/components/ui/use-toast"

// Helper function to safely serialize dates for Redux
const serializeDate = (date: Date): string => {
  return date.toISOString();
};

export default function SalesPage() {
  const dispatch = useAppDispatch()
  const { items: sales, status } = useAppSelector((state) => state.sales)
  const isLoading = status === 'loading'
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewSaleDialog, setShowNewSaleDialog] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB()
        dispatch(fetchSales())
        dispatch(fetchProducts())
      } catch (error) {
        console.error("Failed to load sales:", error)
      }
    }

    loadData()
  }, [dispatch])

  const filteredSales = sales.filter(
    (sale) => {
      const searchLower = searchQuery.toLowerCase()
      // Check customer name if it exists
      const customerMatch = sale.customerId?.toString().includes(searchLower) || false
      // Check sale ID
      const idMatch = sale.id.toString().includes(searchLower)
      // Check items if they exist
      const itemMatch = sale.items?.some((item: SaleItem) => 
        item.productId?.toString().toLowerCase().includes(searchLower) || false
      ) || false
      
      return customerMatch || idMatch || itemMatch
    }
  )

  const handleNewSale = async (saleData: any) => {
    try {
      // Convert the sale data to match our Sale interface
      const newSale: Omit<Sale, 'id'> = {
        date: serializeDate(new Date()),
        customerId: saleData.customerId,
        total: saleData.total,
        status: 'completed',
        items: saleData.items.map((item: any) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          serialNumber: item.serialNumber
        })),
        payments: [{
          id: 0,
          saleId: 0,
          amount: saleData.total,
          method: saleData.paymentType.toLowerCase(),
          date: serializeDate(new Date()),
        }]
      }
      
      // Dispatch the create sale action
      await dispatch(createSale(newSale)).unwrap()
      
      // Refresh product data after sale
      dispatch(fetchProducts())
      
      toast({
        title: "Sale completed",
        description: "The sale has been recorded and inventory updated.",
      })
    } catch (error) {
      console.error("Error processing sale:", error)
      toast({
        title: "Error",
        description: "Failed to process sale. Please try again.",
        variant: "destructive"
      })
    }
    
    setShowNewSaleDialog(false)
  }

  // Function to format date for display
  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString()
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
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading sales...
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No sales found. {sales.length > 0 ? 'Try a different search.' : 'Create your first sale!'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.id}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>{sale.customerId || 'Walk-in'}</TableCell>
                      <TableCell>₱{sale.total.toLocaleString()}</TableCell>
                      <TableCell>{sale.payments && sale.payments[0]?.method ? sale.payments[0].method : 'N/A'}</TableCell>
                      <TableCell className="capitalize">{sale.status}</TableCell>
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
