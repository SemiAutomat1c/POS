"use client"

import { useState, useEffect } from "react"
import { Search, Menu, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useIsMobile } from "@/components/ui/use-mobile"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import NotificationBell from "./notifications/notification-bell"

export default function Header() {
  const isMobile = useIsMobile()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    const sidebar = document.querySelector("aside")
    sidebar?.classList.toggle("hidden")
  }

  return (
    <header className="border-b bg-card sticky top-0 z-10">
      <div className="flex h-16 items-center gap-4 px-6">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        )}
        <div className="flex-1 max-w-3xl">
          <form className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search inventory..." 
                className="w-full pl-9 bg-background" 
              />
            </div>
          </form>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative w-10 h-10"
            >
              <Sun className="h-[1.5rem] w-[1.5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.5rem] w-[1.5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}
          <NotificationBell />
        </div>
      </div>
    </header>
  )
}
