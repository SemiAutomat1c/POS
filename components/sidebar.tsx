"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Users, ShoppingCart, CreditCard, BarChart3, Settings, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

export default function Sidebar() {
  const pathname = usePathname()
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(!isMobile)

  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: <Package className="h-4 w-4" />,
    },
    {
      title: "Customers",
      href: "/customers",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Sales",
      href: "/sales",
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: "Scanner",
      href: "/scanner",
      icon: <QrCode className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

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
          {navItems.map((item) => (
            <li key={item.href}>
              <Button
                asChild
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-10",
                  pathname === item.href && "bg-accent"
                )}
              >
                <Link href={item.href}>
                  {item.icon}
                  {item.title}
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
