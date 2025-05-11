'use client';

import React from 'react';
import ClientProviders from "@/components/client-providers";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

interface RootLayoutClientProps {
  children: React.ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <ClientProviders>
      <div className="min-h-screen">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto p-6 bg-background">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ClientProviders>
  );
} 