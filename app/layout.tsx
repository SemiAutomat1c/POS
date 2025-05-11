import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import RootLayoutClientWrapper from "../components/root-layout-client-wrapper"

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
        <RootLayoutClientWrapper>
          {children}
        </RootLayoutClientWrapper>
      </body>
    </html>
  )
}
