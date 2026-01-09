import "../../types/GoogleServices.d.ts";

import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getClientId } from "./ClientId";

type AuthContextValue = {
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initializedRef = useRef(false);

  const initializeIfNeeded = useCallback(async () => {
    if (initializedRef.current) return;

    await window.googleIdentityServicesLoaded;

    const clientId = getClientId();
    google.accounts.id.initialize({
      client_id: clientId,
      ux_mode: "popup",
      auto_select: true,
      callback: () => {
        setIsAuthenticated(true);
      },
    });

    initializedRef.current = true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await initializeIfNeeded();
        if (cancelled) {
          return;
        }

        google.accounts.id.prompt();
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initializeIfNeeded]);

  const login = useCallback(async () => {
    await initializeIfNeeded();
    google.accounts.id.prompt();
  }, [initializeIfNeeded]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    google.accounts.id.cancel();
    google.accounts.id.disableAutoSelect();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout],
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
