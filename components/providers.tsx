'use client';

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import DatabaseProvider from '@/components/database-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DatabaseProvider>
        {children}
      </DatabaseProvider>
      <Toaster />
    </ThemeProvider>
  )
} 