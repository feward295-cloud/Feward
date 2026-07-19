import { useState } from "react";
import AuthScreen from "./AuthScreen.jsx";
import FewardApp from "./FewardApp.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <AuthScreen onAuthenticated={(u) => setUser(u)} />;
  }

  return <FewardApp user={user} onLogout={() => setUser(null)} />;
}
