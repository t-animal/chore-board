import { useAuth } from "../contexts/AuthContext";

export function LoginHint() {
  const { isAuthenticated, isAuthenticating, login } = useAuth();

  if (isAuthenticated) return null;

  return (
    <div>
      {isAuthenticating ? <p>Signing you in…</p> : <p>Sign in with Google to continue.</p>}

      <button type="button" onClick={() => void login()}>
        Sign in
      </button>
    </div>
  );
}
