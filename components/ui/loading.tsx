import React from 'react';

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