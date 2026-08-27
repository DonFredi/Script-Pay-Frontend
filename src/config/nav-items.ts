export interface NavItem {
  title: string;
  url: string;
}

/**
 * Single source of truth for the tenant dashboard's nav — consumed by both
 * the AppSidebar ((client)/layout.tsx) and the public marketing nav
 * (Navbar/MobileNav, via useNavLinks) so an authenticated tenant sees the
 * same links, in the same order, rendered by the same link component, in
 * both places.
 */
export const TENANT_NAV_ITEMS: NavItem[] = [
  { title: "Home", url: "/" },
  { title: "Dashboard", url: "/dashboard" },
  { title: "Payments", url: "/payments" },
  { title: "Transactions", url: "/transactions" },
  { title: "Settings", url: "/settings" },
  { title: "Profile", url: "/profile" },
];

/** Same idea as TENANT_NAV_ITEMS, for SUPER_ADMIN — mirrors admin/layout.tsx's sidebar. */
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: "Home", url: "/" },
  { title: "Tenants", url: "/admin/dashboard" },
  { title: "API Keys", url: "/admin/api-keys" },
  { title: "Transactions", url: "/admin/transactions" },
  { title: "Audit Logs", url: "/admin/audit-logs" },
  { title: "Profile", url: "/admin/profile" },
];
