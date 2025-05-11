'use client';

import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'sonner';

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export default function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('Initializing database via API...');

        // Step 1: Check database status
        const statusResponse = await fetch('/api/database/status');
        const statusData = await statusResponse.json();
        
        console.log('Database status:', statusData);
        
        if (statusData.environment === 'production' && statusData.connectionStatus !== 'connected') {
          console.error('Database connection failed:', statusData.error);
          setError(`Database connection error: ${statusData.error}`);
          toast.error('Database connection failed', {
            description: statusData.error || 'Could not connect to PostgreSQL',
            duration: 5000,
          });
          return;
        }
        
        // Step 2: Initialize database
        if (statusData.environment === 'production') {
          const initResponse = await fetch('/api/database/initialize');
          const initData = await initResponse.json();
          
          console.log('Database initialization response:', initData);
          
          if (!initData.success) {
            throw new Error(initData.message || 'Failed to initialize database tables');
          }
        } else {
          // For non-production, use the client-side IndexedDB
          const { initDatabase } = await import('@/lib/db-init');
          await initDatabase();
        }
        
        setInitialized(true);
        console.log('Database initialized successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Error initializing database:', errorMessage);
        console.error('Error details:', err);
        setError(`Database error: ${errorMessage}`);
        toast.error('Database error', {
          description: errorMessage,
          duration: 5000,
        });
      }
    };

    initializeDatabase();
  }, []);

  // Show loading state if not initialized
  if (!initialized && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="space-y-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary rounded-full border-t-transparent mx-auto"></div>
          <h2 className="text-xl font-semibold">Initializing Database...</h2>
          <p className="text-muted-foreground">Please wait while we set up the system</p>
        </div>
        <Toaster />
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
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
        <Toaster />
      </div>
    );
  }

  // If initialized and no error, render children
  return (
    <>
      {children}
      <Toaster />
    </>
  );
} 