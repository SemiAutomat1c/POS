'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { initializeDB } from '@/lib/db-adapter';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export default function DatabaseProvider({ children }: DatabaseProviderProps) {
  // Don't check localStorage during initial render to avoid hydration mismatch
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true on mount
  useEffect(() => {
    setIsClient(true);
    // Check localStorage after component mounts
    const wasInitialized = localStorage.getItem('dbInitialized') === 'true';
    setInitialized(wasInitialized);
  }, []);

  useEffect(() => {
    const initializeDatabase = async () => {
      // Skip initialization if already done
      if (initialized) {
        return;
      }

      try {
        // Initialize IndexedDB
        await initializeDB();
        
        // Mark as initialized in localStorage
        localStorage.setItem('dbInitialized', 'true');
        setInitialized(true);
        console.log('Database initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error initializing database:', errorMessage);
        console.error('Error details:', err);
        setError(`Database error: ${errorMessage}`);
        // Remove initialization flag if there was an error
        localStorage.removeItem('dbInitialized');
        toast.error('Database error', {
          description: errorMessage,
          duration: 5000,
        });
      }
    };

    // Only run initialization on client side
    if (isClient && !initialized) {
      initializeDatabase();
    }
  }, [initialized, isClient]);

  // Don't show loading state during SSR
  if (!isClient) {
    return children;
  }

  // Show loading state if not initialized
  if (!initialized && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent mx-auto"></div>
          <h2 className="text-xl font-semibold">Initializing Database...</h2>
          <p className="text-muted-foreground">Please wait while we set up the system</p>
        </div>
      </div>
    );
  }

  // Show error state if there was an error
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center max-w-md p-6 bg-card rounded-lg shadow">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Database Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            onClick={() => {
              localStorage.removeItem('dbInitialized');
              window.location.reload();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If initialized and no error, render children
  return <>{children}</>;
} 