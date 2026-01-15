import "./App.css";

import { CalendarSelector } from "./components/CalendarSelector";
import { ChoresList } from "./components/ChoresList";
import { LoginHint } from "./components/LoginHint";
import { SettingsButton } from "./components/SettingsButton";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ChoresApiProvider } from "./contexts/ChoresApiContext";

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <h1>Chores</h1>
      {!isAuthenticated ? (
        <LoginHint />
      ) : (
        <>
          <CalendarSelector />
          <ChoresList />
          <SettingsButton />
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
