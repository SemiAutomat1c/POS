'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

// Using a more specific typing approach to avoid ReactNode compatibility issues
export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
} 