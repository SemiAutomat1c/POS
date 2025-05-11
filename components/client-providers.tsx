'use client';

import React from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store/store';

export default function ClientProviders({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
} 