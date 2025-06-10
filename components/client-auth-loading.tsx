'use client';

import React, { useEffect, useState } from 'react';

export default function ClientAuthLoading() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
        <h3 className="text-lg font-medium mb-1">Checking authentication...</h3>
        <p className="text-sm text-muted-foreground">Please wait while we verify your session</p>
      </div>
    </div>
  );
} 
 