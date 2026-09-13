import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type AuthState,
  getAuthState,
  requestAccessToken,
  restoreAccessToken,
  signOut,
  subscribeToAuthState,
} from "../lib/googleAuth";

type AuthContextValue = {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(getAuthState);

  useEffect(() => {
    setAuthState(getAuthState());
    return subscribeToAuthState(setAuthState);
  }, []);

  useEffect(() => {
    void restoreAccessToken();
  }, []);

  const login = useCallback(async () => {
    try {
      await requestAccessToken({ silent: false });
    } catch (err) {
      console.error(err);
    }
  }, []);

  const logout = useCallback(() => {
    signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: authState.accessToken !== null,
      isAuthenticating: authState.isAuthenticating,
      accessToken: authState.accessToken,
      login,
      logout,
    }),
    [authState, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
