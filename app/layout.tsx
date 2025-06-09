import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import RootLayoutClient from '@/components/root-layout-client'
import { StorageProvider } from "@/components/providers/StorageProvider"
import { Providers as AuthProviders } from '@/providers'
import { WebApplicationJsonLd, OrganizationJsonLd } from '@/components/structured-data'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

export const metadata: Metadata = {
  title: 'GadgetTrack - Inventory Management',
  description: 'Your complete solution for inventory and point-of-sale management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GadgetTrack',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/apple-icon-180x180.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme') || 'system';
              if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {
              console.error('Error applying theme:', e);
            }
          `
        }} />
        <WebApplicationJsonLd />
        <OrganizationJsonLd />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="theme"
        >
          <AuthProviders>
            <StorageProvider>
              <RootLayoutClient>
                {children}
              </RootLayoutClient>
            </StorageProvider>
          </AuthProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
