"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ADMIN_NAV_ITEMS, TENANT_NAV_ITEMS, type NavItem } from "@/config/nav-items";

/**
 * Rewritten from a static `title` prop into a real breadcrumb trail derived
 * from the current route — matches nav-items.ts (the same source AppSidebar
 * uses) against the pathname, so it stays correct for both the tenant and
 * admin sidebars without either passing a title down manually.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const navItems: NavItem[] = pathname.startsWith("/admin") ? ADMIN_NAV_ITEMS : TENANT_NAV_ITEMS;
  const activeItem = navItems.find((item) => pathname === item.url || pathname.startsWith(`${item.url}/`));
  const extraSegment =
    activeItem && pathname.length > activeItem.url.length ? pathname.slice(activeItem.url.length + 1) : null;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              {activeItem && extraSegment ? (
                <BreadcrumbLink asChild>
                  <Link href={activeItem.url}>{activeItem.title}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{activeItem?.title ?? "Dashboard"}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {extraSegment && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-40 truncate font-mono text-xs">
                    {decodeURIComponent(extraSegment).slice(0, 12)}…
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
