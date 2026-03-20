"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Center, Loader } from "@mantine/core";
import { notifications } from "@mantine/notifications";

type AuthContextValue = {
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  refreshAuth: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function hasValidToken(): boolean {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith("auth_expires="));
  if (!match) return false;
  const expires = new Date(decodeURIComponent(match.split("=")[1]));
  return expires.getTime() > Date.now();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const authenticate = useCallback(async () => {
    try {
      // Skip network request if cookie hasn't expired
      if (hasValidToken()) {
        setIsAuthenticated(true);
        return;
      }

      // No valid cookie — sign in
      const res = await fetch("/api/auth", { method: "POST" });
      if (!res.ok) throw new Error("Auth failed");
      setIsAuthenticated(true);
    } catch (err) {
      notifications.show({
        title: "Authentication Error",
        message: err instanceof Error ? err.message : "Unknown error",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    authenticate();
  }, [authenticate]);

  if (loading) {
    return (
      <Center h="100vh">
        <Loader size="lg" aria-label="Authenticating" />
      </Center>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        refreshAuth: authenticate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
