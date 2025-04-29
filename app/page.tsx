import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "POS System Dashboard",
}

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Add your dashboard content here */}
      </div>
    </div>
  )
} 