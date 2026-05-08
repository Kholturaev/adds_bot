import { createContext, useContext, useState, type ReactNode } from "react";
import type { Credentials } from "../types";

const CRED_KEY = "addsbot_admin_credentials";

function loadCredentials(): Credentials | null {
  const raw = localStorage.getItem(CRED_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Credentials;
    if (!parsed.username || !parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

type AuthContextValue = {
  credentials: Credentials | null;
  login: (creds: Credentials) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials | null>(
    loadCredentials,
  );

  function login(creds: Credentials) {
    localStorage.setItem(CRED_KEY, JSON.stringify(creds));
    setCredentials(creds);
  }

  function logout() {
    localStorage.removeItem(CRED_KEY);
    setCredentials(null);
  }

  return (
    <AuthContext.Provider value={{ credentials, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
