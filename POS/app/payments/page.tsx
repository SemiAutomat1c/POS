"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { initializeDB } from "@/lib/db"

export default function PaymentsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB()
        // In a real app, we would fetch actual data from IndexedDB
        // For now, we'll use mock data
        const mockPayments = [
          {
            id: 1,
            customer: "Maria Santos",
            product: "iPhone 12",
            totalAmount: 50000,
            amountPaid: 40000,
            remainingBalance: 10000,
            dueDate: "2023-04-30",
            status: "partial",
            paymentType: "installment",
            installments: [
              { date: "2023-02-15", amount: 20000 },
              { date: "2023-03-15", amount: 20000 },
              { date: "2023-04-30", amount: 10000, status: "pending" },
            ],
          },
          {
            id: 2,
            customer: "Juan Dela Cruz",
            product: "MacBook Air",
            totalAmount: 75000,
            amountPaid: 60000,
            remainingBalance: 15000,
            dueDate: "2023-05-05",
            status: "partial",
            paymentType: "installment",
            installments: [
              { date: "2023-02-05", amount: 30000 },
              { date: "2023-03-05", amount: 30000 },
              { date: "2023-05-05", amount: 15000, status: "pending" },
            ],
          },
          {
            id: 3,
            customer: "Ana Reyes",
            product: "Samsung TV",
            totalAmount: 42500,
            amountPaid: 34000,
            remainingBalance: 8500,
            dueDate: "2023-05-10",
            status: "partial",
            paymentType: "installment",
            installments: [
              { date: "2023-02-10", amount: 17000 },
              { date: "2023-03-10", amount: 17000 },
              { date: "2023-05-10", amount: 8500, status: "pending" },
            ],
          },
          {
            id: 4,
            customer: "Pedro Lim",
            product: "Samsung Galaxy S21",
            totalAmount: 49990,
            amountPaid: 49990,
            remainingBalance: 0,
            dueDate: null,
            status: "paid",
            paymentType: "full",
            installments: [],
          },
          {
            id: 5,
            customer: "Sofia Garcia",
            product: "iPad Pro",
            totalAmount: 45000,
            amountPaid: 45000,
            remainingBalance: 0,
            dueDate: null,
            status: "paid",
            paymentType: "full",
            installments: [],
          },
        ]
        setPayments(mockPayments)
      } catch (error) {
        console.error("Failed to load payments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredPayments = payments.filter(
    (payment) =>
      payment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="mr-1 h-3 w-3" />
            Partial
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="mr-1 h-3 w-3" />
            Overdue
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track customer payments and installment plans</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">All Payments</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="installments">Installments</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search payments..."
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

            <TabsContent value="all" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          Loading payments...
                        </TableCell>
                      </TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.customer}</TableCell>
                          <TableCell>{payment.product}</TableCell>
                          <TableCell>₱{payment.totalAmount.toLocaleString()}</TableCell>
                          <TableCell>₱{payment.amountPaid.toLocaleString()}</TableCell>
                          <TableCell>
                            {payment.remainingBalance > 0 ? (
                              <span className="text-amber-500 font-medium">
                                ₱{payment.remainingBalance.toLocaleString()}
                              </span>
                            ) : (
                              <span className="text-green-500">₱0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {payment.dueDate ? (
                              new Date(payment.dueDate).toLocaleDateString()
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(payment.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Record Payment</DropdownMenuItem>
                                <DropdownMenuItem>Payment History</DropdownMenuItem>
                                <DropdownMenuItem>Print Receipt</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Other tabs would have similar content */}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
