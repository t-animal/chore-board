export function getClientId(): string {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (typeof clientId !== "string" || clientId.length === 0) {
    throw new Error(
      "Missing VITE_GOOGLE_CLIENT_ID. Set it in a .env file (Vite) before running the UI.",
    );
  }
  return clientId;
}
