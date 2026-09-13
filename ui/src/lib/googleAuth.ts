import "../../types/GoogleServices.d.ts";

import { getClientId } from "../contexts/ClientId";

const calendarScope = "https://www.googleapis.com/auth/calendar";

/** Renew slightly before expiry so requests in flight keep working. */
const refreshMarginMs = 60_000;

const grantedKey = "google-calendar-access-granted";

export type AuthState = {
  accessToken: string | null;
  isAuthenticating: boolean;
};

export function getAuthState(): AuthState {
  return state;
}

export function subscribeToAuthState(listener: (state: AuthState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function requestAccessToken({ silent }: { silent: boolean }): Promise<void> {
  if (pendingRequest) return pendingRequest.promise;

  const { promise, resolve, reject } = Promise.withResolvers<void>();
  pendingRequest = { promise, resolve, reject };
  setState({ isAuthenticating: true });

  void getTokenClient().then(
    // `prompt: ""` reuses an existing grant without showing any UI.
    (client) => client.requestAccessToken(silent ? { prompt: "" } : {}),
    (error: unknown) => onTokenError(error),
  );

  return promise;
}

export async function restoreAccessToken(): Promise<void> {
  if (!hasGrantedAccess()) return;

  try {
    return await requestAccessToken({ silent: true });
  } catch {
    return undefined;
  }
}

export function signOut(): void {
  clearTokenRefresh();
  rememberGrantedAccess(false);
  setState({ accessToken: null, isAuthenticating: false });
}

type PendingRequest = {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
};

let state: AuthState = { accessToken: null, isAuthenticating: false };
const listeners = new Set<(state: AuthState) => void>();

let tokenClient: Promise<google.accounts.oauth2.TokenClient> | null = null;
let pendingRequest: PendingRequest | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function setState(patch: Partial<AuthState>): void {
  state = { ...state, ...patch };
  for (const listener of listeners) {
    listener(state);
  }
}

function hasGrantedAccess(): boolean {
  return localStorage.getItem(grantedKey) !== null;
}

function rememberGrantedAccess(granted: boolean): void {
  if (granted) {
    localStorage.setItem(grantedKey, "true");
  } else {
    localStorage.removeItem(grantedKey);
  }
}

function clearTokenRefresh(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

function scheduleTokenRefresh(expiresInSeconds: number): void {
  clearTokenRefresh();
  if (!Number.isFinite(expiresInSeconds)) return;

  refreshTimer = setTimeout(
    () => {
      // A silent renewal can legitimately fail (grant revoked, Google session
      // gone); the user is signed out and has to use the sign-in button again.
      void requestAccessToken({ silent: true }).catch(() => undefined);
    },
    Math.max(expiresInSeconds * 1000 - refreshMarginMs, 0),
  );
}

function onToken(response: google.accounts.oauth2.TokenResponse): void {
  if (!response.access_token) {
    onTokenError(new Error(response.error_description || response.error || "Authorization failed"));
    return;
  }

  rememberGrantedAccess(true);
  scheduleTokenRefresh(Number(response.expires_in));
  setState({ accessToken: response.access_token, isAuthenticating: false });

  const request = pendingRequest;
  pendingRequest = null;
  request?.resolve();
}

function onTokenError(error: unknown): void {
  clearTokenRefresh();
  setState({ accessToken: null, isAuthenticating: false });

  const request = pendingRequest;
  pendingRequest = null;
  request?.reject(error);
}

function getTokenClient(): Promise<google.accounts.oauth2.TokenClient> {
  // Memoise the promise rather than a boolean flag: concurrent callers would
  // otherwise all slip past the guard while the Identity Services script is
  // still loading and each initialise their own client.
  tokenClient ??= (async () => {
    await window.googleIdentityServicesLoaded;

    return google.accounts.oauth2.initTokenClient({
      client_id: getClientId(),
      scope: calendarScope,
      callback: onToken,
      error_callback: onTokenError,
    });
  })();

  return tokenClient;
}
