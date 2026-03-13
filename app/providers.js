'use client';

import { AppProvider } from '../hooks/useAppContext';

export function Providers({ children }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}
