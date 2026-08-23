"use client";
import { requireRoles } from "@/modules/auth/shared/guards/require-roles";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ADMIN_NAV_ITEMS } from "@/config/nav-items";

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
    <SidebarProvider style={{ "--sidebar-width": "calc(var(--spacing) * 72)" } as React.CSSProperties}>
      <AppSidebar navItems={ADMIN_NAV_ITEMS} userLabel={user?.username ?? user?.email ?? "Admin"} />
      <SidebarInset>
        <SiteHeader />
        <main className="@container/main flex-1 p-6 pt-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
