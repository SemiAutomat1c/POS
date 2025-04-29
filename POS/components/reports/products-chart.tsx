"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface ProductsChartProps {
  period: string
}

export default function ProductsChart({ period }: ProductsChartProps) {
  // In a real app, we would fetch this data from IndexedDB based on the period
  const data = [
    { name: "iPhone 13 Pro", value: 5, color: "#4f46e5" },
    { name: "Samsung Galaxy S21", value: 4, color: "#06b6d4" },
    { name: "MacBook Air", value: 3, color: "#10b981" },
    { name: "AirPods Pro", value: 3, color: "#f59e0b" },
    { name: "iPad Pro", value: 2, color: "#ef4444" },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} units`, "Sold"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
