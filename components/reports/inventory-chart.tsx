"use client"

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card"

interface InventoryChartProps {
  period: string
}

export default function InventoryChart({ period }: InventoryChartProps) {
  return (
    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
      Chart will be implemented here (showing data for {period})
    </div>
  )
}
