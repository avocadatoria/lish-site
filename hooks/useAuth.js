'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api-client.js';
import { ROUTES } from '../common/routes.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/api/auth/me`)
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // PKCE redirect login (Universal Login / signup hint fallback)
  const login = useCallback((screenHint) => {
    const url = screenHint
      ? `/api/auth/login?screen_hint=${encodeURIComponent(screenHint)}`
      : `/api/auth/login`;
    window.location.href = url;
  }, []);

  // Third-party provider login via PKCE redirect (Google, GitHub, etc.)
  const loginWithProvider = useCallback((connection) => {
    window.location.href = `/api/auth/login?connection=${encodeURIComponent(connection)}`;
  }, []);

  // Custom login with email/password (ROPC)
  const loginWithCredentials = useCallback(async (email, password) => {
    const data = await apiFetch(`/api/auth/login`, {
      method: `POST`,
      body: { email, password },
    });
    setUser(data.user);
    return data;
  }, []);

  // Custom signup
  const signup = useCallback(async ({ email, password, firstName, lastName }) => {
    const data = await apiFetch(`/api/auth/signup`, {
      method: `POST`,
      body: { email, password, firstName, lastName },
    });
    setUser(data.user);
    return data;
  }, []);

  // Email OTP — request code
  const startOtp = useCallback(async (email) => {
    return apiFetch(`/api/auth/otp/start`, {
      method: `POST`,
      body: { email },
    });
  }, []);

  // Email OTP — verify code and create session
  const verifyOtp = useCallback(async (email, otp) => {
    const data = await apiFetch(`/api/auth/otp/verify`, {
      method: `POST`,
      body: { email, otp },
    });
    setUser(data.user);
    return data;
  }, []);

  // Federated logout — clears local session + Auth0 session.
  // Optional `notice` (e.g. `account_deleted`) is passed as a query param
  // on /login so the login page can show a confirmation dialog.
  const logout = useCallback(async (notice) => {
    const returnTo = `${ROUTES.LOGIN}?notice=${encodeURIComponent(notice || `logged_out`)}`;
    try {
      const data = await apiFetch(`/api/auth/logout`, {
        method: `POST`,
        body: { returnTo },
      });
      setUser(null);
      if (data?.logoutUrl) {
        window.location.href = data.logoutUrl;
      } else {
        window.location.href = returnTo;
      }
    } catch {
      setUser(null);
      window.location.href = returnTo;
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      const data = await apiFetch(`/api/auth/refresh`, { method: `POST` });
      if (data?.user) setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      loginWithProvider,
      loginWithCredentials,
      startOtp,
      verifyOtp,
      signup,
      logout,
      refreshAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(`useAuth must be used within an AuthProvider`);
  }
  return context;
}
