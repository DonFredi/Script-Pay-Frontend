"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TENANT_NAV_ITEMS } from "@/config/nav-items";

// Auth/role gating for everything under here already happens one level up, in
// (protected)/layout.tsx (the parent ProtectedLayout) — this layout adds the
// tenant-scoped navigation shell AND one more rule: a TENANT_ADMIN who hasn't
// provisioned a tenant yet (tenantId: null) has nothing usable behind this
// sidebar — every page here would just show empty/forbidden states — so they're
// sent to /onboarding instead of landing on a dashboard that can't do anything yet.
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
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)" } as React.CSSProperties}>
      <AppSidebar
        brandLabel="ScriptPay"
        navItems={TENANT_NAV_ITEMS}
        user={{ name: user?.username ?? user?.email ?? "User", email: user?.email ?? "", avatar: "" }}
      />
      <SidebarInset>
        <SiteHeader />
        <main className="@container/main flex-1 p-6 pt-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
