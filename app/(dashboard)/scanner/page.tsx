"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QrCode } from "lucide-react"

export default function ScannerPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Scanner</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Scan Product</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="w-64 h-64 border-2 border-dashed rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-12 h-12 text-muted-foreground" />
            </div>
            <Button>Start Scanning</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 