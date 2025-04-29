"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface SalesChartProps {
  period: string
}

export default function SalesChart({ period }: SalesChartProps) {
  // In a real app, we would fetch this data from IndexedDB based on the period
  const getDummyData = () => {
    if (period === "week") {
      return [
        { name: "Mon", total: 15000 },
        { name: "Tue", total: 25000 },
        { name: "Wed", total: 18000 },
        { name: "Thu", total: 32000 },
        { name: "Fri", total: 45000 },
        { name: "Sat", total: 65000 },
        { name: "Sun", total: 45500 },
      ]
    } else if (period === "month") {
      return [
        { name: "Week 1", total: 65000 },
        { name: "Week 2", total: 58000 },
        { name: "Week 3", total: 75000 },
        { name: "Week 4", total: 47500 },
      ]
    } else if (period === "quarter") {
      return [
        { name: "Jan", total: 175000 },
        { name: "Feb", total: 185000 },
        { name: "Mar", total: 245500 },
      ]
    } else {
      return [
        { name: "Q1", total: 605500 },
        { name: "Q2", total: 725000 },
        { name: "Q3", total: 850000 },
        { name: "Q4", total: 950000 },
      ]
    }
  }

  const data = getDummyData()

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₱${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => [`₱${value.toLocaleString()}`, "Sales"]}
          labelFormatter={(label) => `${label}`}
        />
        <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
        <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
