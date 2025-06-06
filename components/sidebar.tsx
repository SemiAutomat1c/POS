"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Users, ShoppingCart, CreditCard, BarChart3, Settings, QrCode, RefreshCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/components/ui/use-mobile"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-sky-500',
  },
  {
    label: 'Inventory',
    icon: Package,
    href: '/dashboard/inventory',
    color: 'text-violet-500',
  },
  {
    label: 'Customers',
    icon: Users,
    href: '/dashboard/customers',
    color: 'text-pink-700',
  },
  {
    label: 'Sales',
    icon: ShoppingCart,
    href: '/dashboard/sales',
    color: 'text-orange-700',
  },
  {
    label: 'Returns',
    icon: RefreshCcw,
    href: '/dashboard/returns',
    color: 'text-green-700',
  },
  {
    label: 'Payments',
    icon: CreditCard,
    href: '/dashboard/payments',
    color: 'text-emerald-500',
  },
  {
    label: 'Reports',
    icon: BarChart3,
    href: '/dashboard/reports',
    color: 'text-blue-700',
  },
  {
    label: 'Scanner',
    icon: QrCode,
    href: '/dashboard/scanner',
    color: 'text-rose-500',
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/dashboard/settings',
    color: 'text-gray-700',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    setIsOpen(!isMobile)
  }, [isMobile])

  // During SSR and first render, show a basic sidebar
  if (!hasMounted) {
    return (
      <aside className="bg-card border-r w-64 flex-shrink-0 flex flex-col h-full">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-xl">GadgetTrack</h2>
          <p className="text-sm text-muted-foreground">Inventory Management</p>
        </div>
        <nav className="flex-1 overflow-auto py-6 px-3">
          <ul className="space-y-1">
            {routes.map((route) => (
              <li key={route.href}>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                >
                  <Link href={route.href}>
                    <div className="flex items-center flex-1">
                      <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                      {route.label}
                    </div>
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-6 border-t">
          <div className="text-sm text-muted-foreground">
            <p>Offline Mode Active</p>
            <p className="text-xs mt-1">Last synced: Never</p>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className={cn(
        "bg-card border-r w-64 flex-shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out",
        isMobile && !isOpen && "hidden"
      )}
    >
      <div className="p-6 border-b">
        <h2 className="font-semibold text-xl">GadgetTrack</h2>
        <p className="text-sm text-muted-foreground">Inventory Management</p>
      </div>
      <nav className="flex-1 overflow-auto py-6 px-3">
        <ul className="space-y-1">
          {routes.map((route) => (
            <li key={route.href}>
              <Button
                asChild
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  pathname === route.href && "bg-accent"
                )}
              >
                <Link href={route.href}>
                  <div className="flex items-center flex-1">
                    <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                    {route.label}
                  </div>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-6 border-t">
        <div className="text-sm text-muted-foreground">
          <p>Offline Mode Active</p>
          <p className="text-xs mt-1">Last synced: Never</p>
        </div>
      </div>
    </aside>
  )
}
