import "./App.css";

import { CalendarSelector } from "./components/CalendarSelector";
import { ChoresList } from "./components/ChoresList";
import { LoginHint } from "./components/LoginHint";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChoresApiProvider } from "./contexts/ChoresApiContext";

function AppContent() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <h1>Chores</h1>
      {!isAuthenticated ? (
        <LoginHint />
      ) : (
        <>
          <button type="button" onClick={logout}>
            Logout
          </button>
          <CalendarSelector />
          <ChoresList />
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChoresApiProvider>
        <AppContent />
      </ChoresApiProvider>
    </AuthProvider>
  );
}
