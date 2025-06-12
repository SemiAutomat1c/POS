"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InventoryChart from "@/components/reports/inventory-chart"
import FeatureGuard from "@/components/subscription/FeatureGuard"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const [period, setPeriod] = useState("7d")
  const router = useRouter()

  // Fallback UI to show when access is denied
  const SubscriptionFallback = () => (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center">
      <div className="rounded-full bg-amber-100 p-4 w-20 h-20 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-amber-600"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold">Reports Require a Basic Plan or Higher</h2>
      <p className="text-gray-600 max-w-md">
        Unlock detailed reports and analytics by upgrading to our Basic, Premium, or Enterprise plans. Get valuable insights into your business performance.
      </p>
      <Button onClick={() => router.push('/dashboard/subscription')}>
        Upgrade Your Plan
      </Button>
    </div>
  )

  return (
    <FeatureGuard feature="reports" fallback={<SubscriptionFallback />}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Reports</h1>
          <Tabs defaultValue="7d" onValueChange={setPeriod}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <InventoryChart period={period} />
            </CardContent>
          </Card>
        </div>
      </div>
    </FeatureGuard>
  )
} 