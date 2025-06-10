'use client';

import React, { useState, useEffect } from 'react';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = 'Loading...', fullScreen = true }: LoadingProps) {
  const content = (
    <div className="flex items-center justify-center gap-2">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
}

export function AuthLoading() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Return nothing during server-side rendering
  }

  return (
    <div suppressHydrationWarning className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div suppressHydrationWarning className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div suppressHydrationWarning className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <h3 suppressHydrationWarning className="text-lg font-medium mb-1">Checking authentication...</h3>
        <p suppressHydrationWarning className="text-sm text-muted-foreground">Please wait while we verify your session</p>
      </div>
    </div>
  );
} 