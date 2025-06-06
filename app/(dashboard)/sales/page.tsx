"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SalesPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales</h1>
        <Button onClick={() => router.push('/dashboard/sales/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Sale
        </Button>
      </div>
    </div>
  )
} 