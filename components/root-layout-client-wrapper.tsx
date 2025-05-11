'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const RootLayoutClient = dynamic(() => import('./root-layout-client'), {
  ssr: false,
});

interface RootLayoutClientWrapperProps {
  children: React.ReactNode;
}

export default function RootLayoutClientWrapper({ children }: RootLayoutClientWrapperProps) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
} 