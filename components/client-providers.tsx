'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store';
import DatabaseProvider from './database-provider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <DatabaseProvider>
          {children}
        </DatabaseProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
} 