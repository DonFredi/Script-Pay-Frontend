"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiPrivate, setAccessToken } from "@/shared/lib/api-client";
import { getCurrentUser } from "@/modules/auth/me/me.api";
import type { User } from "@/modules/auth/shared/types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
  updateUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  isInitialized: false,
  setSession: () => {},
  clearSession: () => {},
  updateUser: () => {},
});

/**
 * Rewritten: this used to track auth state via Firebase's onAuthStateChanged,
 * which is completely disconnected from the actual login flow — login.api.ts posts
 * a Firebase ID token to this app's OWN backend and gets back a backend-issued
 * access+refresh token pair; it never calls any Firebase client SDK method that
 * would trigger onAuthStateChanged. The result was that a "successful" login never
 * actually set isAuthenticated to true. Session state is now driven entirely by
 * this backend's own tokens instead: on mount, attempt a silent refresh (using the
 * httpOnly refresh_token cookie) to recover a session across page reloads/new tabs,
 * then fetch /profile. setSession()/clearSession() are called directly by
 * useLogin/useRegister/useLogout on success, no reliance on any external listener.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const setSession = useCallback((nextUser: User, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  /**
   * For cases like onboarding, where the access token was already refreshed
   * separately (it now carries a new tenantId claim) and only the local `user`
   * object needs to catch up — this deliberately does NOT touch the token, unlike
   * setSession, to avoid any risk of overwriting a valid in-memory token with a
   * stale or empty value.
   */
  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function rehydrateSession() {
      try {
        // Relies on the httpOnly refresh_token cookie sent automatically via
        // withCredentials — if there's no valid session, this simply returns
        // { accessToken: null } (see backend AuthController.refresh), not an error.
        const res = await apiPrivate.post("/auth/refresh", {});
        const accessToken: string | null = res.data?.payload?.accessToken ?? null;

        if (!accessToken) {
          if (!cancelled) {
            setLoading(false);
            setIsInitialized(true);
          }
          return;
        }

        setAccessToken(accessToken);
        const currentUser = await getCurrentUser();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        // No valid session (expired/revoked/missing refresh cookie) — this is the
        // normal "not logged in" case, not something to surface as an error.
        setAccessToken(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    }

    rehydrateSession();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, isInitialized, setSession, clearSession, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
