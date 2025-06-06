"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode } from "lucide-react"

export default function ScannerPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Scanner</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scan Product</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <QrCode className="h-24 w-24 mb-4 text-muted-foreground" />
          <p className="text-center text-muted-foreground mb-4">
            Position the barcode or QR code in front of your camera
          </p>
          <Button>
            Start Scanning
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 