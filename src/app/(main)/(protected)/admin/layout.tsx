"use client";
import { requireRoles } from "@/modules/auth/shared/guards/require-roles";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Header from "@/shared/components/layout/Header";

// Nav (Header, shared with the public marketing pages and the tenant dashboard)
// is role-aware via useNavLinks() — it resolves to ADMIN_NAV_ITEMS for a
// logged-in SUPER_ADMIN automatically, so there's no separate admin sidebar to
// keep in sync with it anymore.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized, user } = useAuth();

  if (!isInitialized) return <FullScreenLoader />;
  // Not logged in
  if (!user) {
    redirect("/auth/login");
  }
  // Logged in but not SUPER_ADMIN — this check was previously commented out
  // entirely, meaning ANY authenticated user (any tenant staff/admin) could reach
  // every /admin/* page regardless of role. Fixed, and using the real role name
  // ("admin" never matched anything the backend actually issues).
  if (isAuthenticated && !requireRoles(user?.roles, ["SUPER_ADMIN"])) {
    redirect("/unauthorized");
  }

  return (
    <>
      <Header />
      <main className="flex-1 p-6">{children}</main>
    </>
  );
}
