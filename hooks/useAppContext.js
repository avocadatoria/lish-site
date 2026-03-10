'use client';

import { createContext, useContext, useRef, useCallback } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const storeRef = useRef({});

  const get = useCallback((key) => storeRef.current[key], []);

  const set = useCallback((key, value) => {
    storeRef.current[key] = value;
  }, []);

  const take = useCallback((key) => {
    const value = storeRef.current[key];
    delete storeRef.current[key];
    return value;
  }, []);

  return (
    <AppContext.Provider value={{ get, set, take }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error(`useAppContext must be used within AppProvider`);
  return ctx;
}
