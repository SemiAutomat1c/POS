import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientProviders from "@/components/client-providers"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { DatabaseProvider } from "@/components/database-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GadgetTrack - Inventory Management",
  description: "Modern inventory management system for gadget shops",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientProviders>
          <DatabaseProvider>
            <div className="min-h-screen">
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1 overflow-y-auto p-6 bg-background">
                    {children}
                  </main>
                </div>
              </div>
            </div>
          </DatabaseProvider>
        </ClientProviders>
      </body>
    </html>
  )
}
