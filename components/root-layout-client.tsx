'use client';

import { usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"
import { SearchBar } from "@/components/search-bar"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import dynamic from 'next/dynamic'
import DatabaseProvider from "@/components/database-provider"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

// Use dynamic import with no SSR for the Toaster
const ClientToaster = dynamic(() => import('@/components/client-toaster'), { ssr: false });

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isMarketingPage = pathname === '/' || 
                          pathname.startsWith('/login') || 
                          pathname.startsWith('/register') ||
                          pathname.startsWith('/forgot-password') ||
                          pathname.startsWith('/reset-password')

  const isDemoPage = pathname.startsWith('/dashboard/demo') || pathname.startsWith('/demo')

  if (isMarketingPage || isDemoPage) {
    return (
      <DatabaseProvider>
        {children}
        <ClientToaster />
        <OfflineIndicator />
        <PWAInstallPrompt />
      </DatabaseProvider>
    )
  }

  return (
    <DatabaseProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 border-b bg-background">
            <SearchBar />
            <div className="flex items-center gap-2">
              <ModeToggle />
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
      <ClientToaster />
      <OfflineIndicator />
    </DatabaseProvider>
  )
} 