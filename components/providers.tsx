'use client';

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import DatabaseProvider from '@/components/database-provider'
import { useEffect } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Apply theme from localStorage on client side
  useEffect(() => {
    // Check if there's a theme preference in localStorage
    const storedTheme = localStorage.getItem('theme');
    
    // If there is, apply the appropriate class to the document
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    console.log("Theme initialized from localStorage:", storedTheme || 'not found');
  }, []);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      <DatabaseProvider>
        {children}
      </DatabaseProvider>
      <Toaster />
    </ThemeProvider>
  )
} 