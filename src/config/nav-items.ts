import type { Icon } from "@tabler/icons-react";
import {
  IconBuildingBank,
  IconCreditCard,
  IconDashboard,
  IconFileText,
  IconHistory,
  IconHome,
  IconKey,
  IconSettings,
} from "@tabler/icons-react";

export interface NavItem {
  title: string;
  url: string;
  icon: Icon;
}

/**
 * Single source of truth for the tenant dashboard's nav — consumed by both
 * the AppSidebar ((client)/layout.tsx) and the public marketing nav
 * (Navbar/MobileNav, via useNavLinks) so an authenticated tenant sees the
 * same links in both places and the two can never drift apart again.
 */
export const TENANT_NAV_ITEMS: NavItem[] = [
  { title: "Home", url: "/", icon: IconHome },
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Payments", url: "/payments", icon: IconCreditCard },
  { title: "Transactions", url: "/transactions", icon: IconHistory },
  { title: "API Keys", url: "/api-keys", icon: IconKey },
  { title: "Settings", url: "/settings", icon: IconSettings },
];

/** Same idea as TENANT_NAV_ITEMS, for SUPER_ADMIN — mirrors admin/layout.tsx's sidebar. */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: "Home", url: "/", icon: IconHome },
  { title: "Tenants", url: "/admin/dashboard", icon: IconBuildingBank },
  { title: "API Keys", url: "/admin/api-keys", icon: IconKey },
  { title: "Transactions", url: "/admin/transactions", icon: IconHistory },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: IconFileText },
];
