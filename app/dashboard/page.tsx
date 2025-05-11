import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardPage() {
  // Mock data - replace with actual data from your backend later
  const totalSales = 15000
  const salesIncrease = 2500
  const totalRevenue = 25000
  const revenueIncrease = 4000
  const totalExpenses = 8000
  const expensesIncrease = 1000

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          <p className="text-xs text-muted-foreground">+{formatCurrency(salesIncrease)} from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">+{formatCurrency(revenueIncrease)} from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">+{formatCurrency(expensesIncrease)} from last month</p>
        </CardContent>
      </Card>
    </div>
  )
} 