"use client"

import { useState, useEffect } from "react"
import { Search, Filter, RefreshCcw, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { initializeDB } from "@/lib/db"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchReturns } from "@/store/slices/returnSlice"
import { fetchSales } from "@/store/slices/saleSlice"
import { fetchProducts } from "@/store/slices/productSlice"
import { Return, ReturnStatus } from "@/lib/models/Return"
import NewReturnDialog from "@/components/returns/new-return-dialog"
import ReturnDetails from "@/components/returns/return-details"
import { useToast } from "@/components/ui/use-toast"

export default function ReturnsPage() {
  const dispatch = useAppDispatch()
  const { items: returns, status } = useAppSelector((state) => state.returns)
  const isLoading = status === 'loading'
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [timeFilter, setTimeFilter] = useState("all")
  const [showNewReturnDialog, setShowNewReturnDialog] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDB()
        dispatch(fetchReturns())
        dispatch(fetchSales())
        dispatch(fetchProducts())
      } catch (error) {
        console.error("Failed to load returns:", error)
      }
    }

    loadData()
  }, [dispatch])

  const getReturnStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>
      case 'approved':
        return <Badge className="bg-blue-500/10 text-blue-500">Approved</Badge>
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-gray-500/10 text-gray-500">Unknown</Badge>
    }
  }

  const getReturnTypeBadge = (type: string) => {
    switch (type) {
      case 'refund':
        return <Badge className="bg-green-500/10 text-green-500">Refund</Badge>
      case 'exchange':
        return <Badge className="bg-blue-500/10 text-blue-500">Exchange</Badge>
      case 'store_credit':
        return <Badge className="bg-purple-500/10 text-purple-500">Store Credit</Badge>
      default:
        return <Badge className="bg-gray-500/10 text-gray-500">Unknown</Badge>
    }
  }

  // Filter returns based on user selections
  const filteredReturns = returns.filter((returnItem) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const searchMatch = returnItem.id.toString().includes(searchLower) ||
                       returnItem.originalSaleId.toString().includes(searchLower) ||
                       (returnItem.customerId?.toString() || '').includes(searchLower)
    
    // Status filter
    const statusMatch = statusFilter === 'all' || returnItem.status === statusFilter
    
    // Time filter (simple implementation, would need to be more sophisticated in real app)
    let timeMatch = true
    if (timeFilter === 'today') {
      const today = new Date()
      const returnDate = new Date(returnItem.returnDate)
      timeMatch = today.toDateString() === returnDate.toDateString()
    } else if (timeFilter === 'week') {
      const now = new Date()
      const weekAgo = new Date(now.setDate(now.getDate() - 7))
      const returnDate = new Date(returnItem.returnDate)
      timeMatch = returnDate >= weekAgo
    } else if (timeFilter === 'month') {
      const now = new Date()
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
      const returnDate = new Date(returnItem.returnDate)
      timeMatch = returnDate >= monthAgo
    }

    // Tab filter
    let tabMatch = true
    if (activeTab === 'pending') {
      tabMatch = returnItem.status === 'pending'
    } else if (activeTab === 'completed') {
      tabMatch = returnItem.status === 'completed'
    }
    
    return searchMatch && statusMatch && timeMatch && tabMatch
  })

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
          <h1 className="text-3xl font-bold tracking-tight">Returns & Exchanges</h1>
          <p className="text-muted-foreground">Process and manage product returns and exchanges</p>
        </div>
        <Button onClick={() => setShowNewReturnDialog(true)}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          New Return
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Return Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Returns</TabsTrigger>
              <TabsTrigger value="pending" className="flex gap-2 items-center">
                Pending
                <Badge className="bg-yellow-500/10 text-yellow-500">{returns.filter(r => r.status === 'pending').length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search returns..."
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

            <TabsContent value={activeTab} className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Original Sale</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          Loading returns...
                        </TableCell>
                      </TableRow>
                    ) : filteredReturns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No returns found. {returns.length > 0 ? 'Try a different search.' : 'Process your first return!'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReturns.map((returnItem) => (
                        <TableRow key={returnItem.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedReturn(returnItem)}>
                          <TableCell className="font-medium">#{returnItem.id}</TableCell>
                          <TableCell>{formatDate(returnItem.returnDate)}</TableCell>
                          <TableCell>#{returnItem.originalSaleId}</TableCell>
                          <TableCell>{returnItem.customerId || 'Walk-in'}</TableCell>
                          <TableCell>{getReturnTypeBadge(returnItem.returnType)}</TableCell>
                          <TableCell>₱{returnItem.refundAmount.toLocaleString()}</TableCell>
                          <TableCell>{getReturnStatusBadge(returnItem.status)}</TableCell>
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Return Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returns.length}</div>
            <p className="text-xs text-muted-foreground">
              +{returns.filter(r => {
                const date = new Date(r.returnDate);
                const today = new Date();
                return date.toDateString() === today.toDateString();
              }).length} today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Returns</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returns.filter(r => r.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* This would need to be calculated based on total sales */}
              {returns.length > 0 ? "2.4%" : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{returns.reduce((total, r) => total + r.refundAmount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Show dialogs when appropriate */}
      {showNewReturnDialog && (
        <NewReturnDialog 
          open={showNewReturnDialog} 
          onClose={() => setShowNewReturnDialog(false)} 
        />
      )}

      {selectedReturn && (
        <ReturnDetails
          returnData={selectedReturn}
          open={!!selectedReturn}
          onClose={() => setSelectedReturn(null)}
        />
      )}
    </div>
  )
} 