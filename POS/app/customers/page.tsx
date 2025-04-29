"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Phone, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { initializeDB } from "@/lib/db"

export default function CustomersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [customers, setCustomers] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB()
        // In a real app, we would fetch actual data from IndexedDB
        // For now, we'll use mock data
        const mockCustomers = [
          {
            id: 1,
            name: "Maria Santos",
            phone: "0917-123-4567",
            email: "maria@example.com",
            totalPurchases: 3,
            totalSpent: 85990,
            outstandingBalance: 10000,
            lastPurchase: "2023-04-15",
          },
          {
            id: 2,
            name: "Juan Dela Cruz",
            phone: "0918-765-4321",
            email: "juan@example.com",
            totalPurchases: 2,
            totalSpent: 75000,
            outstandingBalance: 15000,
            lastPurchase: "2023-04-10",
          },
          {
            id: 3,
            name: "Ana Reyes",
            phone: "0919-555-7890",
            email: "ana@example.com",
            totalPurchases: 5,
            totalSpent: 120000,
            outstandingBalance: 8500,
            lastPurchase: "2023-04-05",
          },
          {
            id: 4,
            name: "Pedro Lim",
            phone: "0920-888-9999",
            email: "pedro@example.com",
            totalPurchases: 1,
            totalSpent: 49990,
            outstandingBalance: 0,
            lastPurchase: "2023-03-28",
          },
          {
            id: 5,
            name: "Sofia Garcia",
            phone: "0921-444-3333",
            email: "sofia@example.com",
            totalPurchases: 4,
            totalSpent: 95000,
            outstandingBalance: 0,
            lastPurchase: "2023-03-20",
          },
        ]
        setCustomers(mockCustomers)
      } catch (error) {
        console.error("Failed to load customers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your customer records and payment history</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Total: {customers.length} customers
              </Badge>
              <Badge variant="secondary" className="text-sm">
                With Balance: {customers.filter((c) => c.outstandingBalance > 0).length}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Outstanding</TableHead>
                  <TableHead>Last Purchase</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading customers...
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center text-xs">
                            <Phone className="mr-1 h-3 w-3" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="mr-1 h-3 w-3" />
                            {customer.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{customer.totalPurchases}</TableCell>
                      <TableCell>₱{customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>
                        {customer.outstandingBalance > 0 ? (
                          <span className="text-amber-500 font-medium">
                            ₱{customer.outstandingBalance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-green-500">Paid</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(customer.lastPurchase).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Payment History</DropdownMenuItem>
                            <DropdownMenuItem>Record Payment</DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
