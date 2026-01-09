import { useAuth } from "../contexts/AuthContext";

export function LoginHint() {
  const { isAuthenticated, login } = useAuth();

  if (isAuthenticated) return null;

  return (
    <div>
      <p>Sign in with Google to continue.</p>
      <button type="button" onClick={() => void login()}>
        Sign in
      </button>
    </div>
  );
}
