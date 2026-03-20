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

type AuthContextValue =  {
  token: string | undefined;
  isAuthenticated: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  token: undefined,
  isAuthenticated: false,
  refreshAuth: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string>();
  const [loading, setLoading] = useState(true);

  const authenticate = useCallback(async () => {
    try {
      const res = await fetch("/api/auth", { method: "POST" });
      if (!res.ok) throw new Error("Auth failed");
      const data = await res.json();
      setToken(data.jwt_access_token);
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
        token,
        isAuthenticated: !!token,
        refreshAuth: authenticate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
