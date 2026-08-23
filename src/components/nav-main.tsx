"use client";

import { useSidebar } from "@/components/ui/sidebar";
import MobileNavLink from "@/shared/components/layout/nav/components/MobileNavLink";
import type { NavItem } from "@/config/nav-items";

/**
 * Rewritten to reuse the exact same MobileNavLink component the public
 * marketing nav's mobile sheet uses, instead of the icon-based
 * SidebarMenuButton list shadcn's dashboard-01 block template used. The
 * sidebar and the top nav already read from the same TENANT_NAV_ITEMS /
 * ADMIN_NAV_ITEMS config (see nav-items.ts) — sharing the link component
 * itself too means they render identically, not just link to the same places.
 */
export function NavMain({ items }: { items: NavItem[] }) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <ul className="flex flex-col gap-1 divide-y divide-slate-200">
      {items.map((item) => (
        <li key={item.title}>
          <MobileNavLink href={item.url} label={item.title} onClick={() => isMobile && setOpenMobile(false)} />
        </li>
      ))}
    </ul>
  );
}
