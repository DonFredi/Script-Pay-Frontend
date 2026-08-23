"use client";

import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { ADMIN_NAV_ITEMS, TENANT_NAV_ITEMS } from "@/config/nav-items";

export interface NavLinkItem {
  to: string;
  label: string;
}

const HOME_LINK: NavLinkItem = { to: "/", label: "Home" };

const GUEST_LINKS: NavLinkItem[] = [
  HOME_LINK,
  { to: "/auth/login", label: "Login" },
  { to: "/auth/register", label: "Register" },
];

/**
 * Drives both Navbar (desktop) and MobileNav — logged out, this is just the
 * marketing links; logged in, it mirrors whichever dashboard sidebar
 * (TENANT_NAV_ITEMS or ADMIN_NAV_ITEMS, from the same config those sidebars
 * themselves use) the user would actually land in, so the public nav can't
 * drift out of sync with the real sidebar the way it previously did. Both of
 * those already start with a "Home" entry, so it isn't prepended again here
 * (that would double it up) — only GUEST_LINKS needs it added manually.
 */
export function useNavLinks(): NavLinkItem[] {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return GUEST_LINKS;

  const dashboardItems = user.roles?.includes("SUPER_ADMIN") ? ADMIN_NAV_ITEMS : TENANT_NAV_ITEMS;
  return dashboardItems.map((item) => ({ to: item.url, label: item.title }));
}
