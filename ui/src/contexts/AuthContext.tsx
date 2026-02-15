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
  isAuthenticating: boolean;
  login: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const initializedRef = useRef(false);

  const performLoginWithGoogle = useCallback((opts?: { isCancelled?: () => boolean }) => {
    setIsAuthenticating(true);
    google.accounts.id.prompt((notification) => {
      if (opts?.isCancelled?.()) return;

      const ended =
        notification?.isNotDisplayed?.() ||
        notification?.isSkippedMoment?.() ||
        notification?.isDismissedMoment?.();

      if (ended) {
        setIsAuthenticating(false);
      }
    });
  }, []);

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
        setIsAuthenticating(false);
      },
    });

    initializedRef.current = true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsAuthenticating(true);
        await initializeIfNeeded();
        if (cancelled) {
          return;
        }

        performLoginWithGoogle({
          isCancelled: () => cancelled,
        });
      } catch (err) {
        if (!cancelled) {
          setIsAuthenticating(false);
        }
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initializeIfNeeded, performLoginWithGoogle]);

  const login = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      await initializeIfNeeded();
      performLoginWithGoogle();
    } catch (err) {
      setIsAuthenticating(false);
      throw err;
    }
  }, [initializeIfNeeded, performLoginWithGoogle]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setIsAuthenticating(false);
    google.accounts.id.cancel();
    google.accounts.id.disableAutoSelect();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isAuthenticating,
      login,
      logout,
    }),
    [isAuthenticated, isAuthenticating, login, logout],
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
