import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import RootLayoutClient from '@/components/root-layout-client'
import { StorageProvider } from "@/components/providers/StorageProvider"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GadgetTrack - Inventory Management',
  description: 'Your complete solution for inventory and point-of-sale management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <StorageProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </StorageProvider>
        </Providers>
      </body>
    </html>
  )
}
