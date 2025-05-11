'use client';

import React, { useEffect, useState } from 'react';
import { initializeDB } from '@/lib/db';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on the client side
    if (typeof window === 'undefined') return;

    const initDb = async () => {
      try {
        await initializeDB();
        console.log('Database initialized successfully');
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err.message : 'Unknown database error');
      }
    };

    initDb();
  }, []);

  // Show loading state while database is initializing
  if (!isInitialized && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-medium mb-2">Loading database...</h2>
          <p className="text-muted-foreground">Please wait while we set up your system</p>
        </div>
      </div>
    );
  }

  // Show error state if database initialization failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-destructive/10 rounded-lg border border-destructive/20">
          <h2 className="text-xl font-medium mb-2 text-destructive">Database Error</h2>
          <p className="mb-4 text-muted-foreground">{error}</p>
          <p className="text-sm">
            This application requires IndexedDB support. Please ensure your browser supports IndexedDB and 
            that you're not in private browsing mode.
          </p>
          <button 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render children when database is ready
  return <>{children}</>;
} 