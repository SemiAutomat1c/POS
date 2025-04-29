"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"

interface InventoryChartProps {
  period: string
}

export default function InventoryChart({ period }: InventoryChartProps) {
  // In a real app, we would fetch this data from IndexedDB
  const data = [
    { name: "Phones", stock: 15, threshold: 5, color: "#4f46e5" },
    { name: "Accessories", stock: 45, threshold: 10, color: "#06b6d4" },
    { name: "Speakers", stock: 12, threshold: 8, color: "#10b981" },
    { name: "Printers", stock: 8, threshold: 5, color: "#f59e0b" },
    { name: "Laptops", stock: 6, threshold: 3, color: "#ef4444" },
  ]

  const getBarColor = (stock: number, threshold: number) => {
    if (stock <= threshold / 2) return "#ef4444" // red for critical
    if (stock <= threshold) return "#f59e0b" // amber for low
    return "#10b981" // green for good
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical">
        <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value} units`,
            name === "threshold" ? "Minimum Stock" : "Current Stock",
          ]}
        />
        <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" horizontal={false} />
        <Bar dataKey="stock" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.stock, entry.threshold)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
