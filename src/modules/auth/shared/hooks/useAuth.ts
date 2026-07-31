"use client";
import { useAuthContext } from "@/providers/AuthProvider";

export const useAuth = () => {
  const { user, isAuthenticated, loading, isInitialized, setSession, clearSession, updateUser } = useAuthContext();
  return {
    user,
    isAuthenticated,
    loading,
    isInitialized,
    setSession,
    clearSession,
    updateUser,
  };
};
