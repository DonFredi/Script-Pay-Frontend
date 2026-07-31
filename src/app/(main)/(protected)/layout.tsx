"use client";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  useEffect(() => {

    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}
