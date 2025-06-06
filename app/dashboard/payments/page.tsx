"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PaymentsPage() {
  const router = useRouter()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Button onClick={() => router.push('/dashboard/payments/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Payment
        </Button>
      </div>
    </div>
  )
} 