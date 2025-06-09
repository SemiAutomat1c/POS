"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Users, ShoppingCart, CreditCard, BarChart3, Settings, QrCode, RefreshCcw, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useAuth } from "@/providers/AuthProvider"
import { logout } from "@/lib/auth/actions"
import { Separator } from "@/components/ui/separator"

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
  const { user } = useAuth()

  useEffect(() => {
    setHasMounted(true)
    setIsOpen(!isMobile)
  }, [isMobile])

  const handleLogout = async () => {
    await logout()
  }

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
                    <div className="flex items-center flex-1" suppressHydrationWarning>
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
                  <div className="flex items-center flex-1" suppressHydrationWarning>
                    <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                    {route.label}
                  </div>
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex flex-col space-y-3">
          {/* User profile section */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || 'Loading...'}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="w-full justify-start"
            >
              <Link href="/dashboard/profile">
                <div className="flex items-center" suppressHydrationWarning>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </div>
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <div className="flex items-center" suppressHydrationWarning>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </div>
            </Button>
          </div>
          
          {/* System status info */}
          <div className="text-xs text-muted-foreground mt-2">
            <p>Offline Mode Active</p>
            <p className="mt-1">Last synced: Never</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
