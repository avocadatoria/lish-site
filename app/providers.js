'use client';

import { AppProvider } from '../hooks/useAppContext';
import { AuthProvider } from '../hooks/useAuth';

export function Providers({ children }) {
  return (
    <AppProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </AppProvider>
  );
}
