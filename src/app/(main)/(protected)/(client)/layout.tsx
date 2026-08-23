"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import Header from "@/shared/components/layout/Header";

// Auth/role gating for everything under here already happens one level up, in
// (protected)/layout.tsx (the parent ProtectedLayout) — this layout adds one
// more rule: a TENANT_ADMIN who hasn't provisioned a tenant yet (tenantId: null)
// has nothing usable behind this nav — every page here would just show
// empty/forbidden states — so they're sent to /onboarding instead of landing on
// a dashboard that can't do anything yet.
//
// Nav itself (Header, shared with the public marketing pages) is role-aware via
// useNavLinks() — it resolves to TENANT_NAV_ITEMS for a logged-in tenant user
// automatically, so there's no separate sidebar to keep in sync with it anymore.
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && user && !user.tenantId) {
      router.replace("/onboarding");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized || (user && !user.tenantId)) return <FullScreenLoader />;

  return (
    <>
      <Header />
      <main className="flex-1 p-6">{children}</main>
    </>
  );
}
