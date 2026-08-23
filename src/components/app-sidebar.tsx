"use client"

import * as React from "react"
import { XIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import Badge from "@/shared/components/shared/Badge"
import Copyright from "@/shared/components/shared/Copyright"
import { siteConfig } from "@/config/site"
import type { NavItem } from "@/config/nav-items"

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navItems: NavItem[]
  userLabel: string
}

/**
 * Reuses the exact same building blocks as the public marketing nav's mobile
 * sheet — Badge for the brand row, MobileNavLink (via NavMain) for each item,
 * LogoutButton (via NavUser) for signing out, and the same site-name/copyright
 * footer — instead of shadcn's dashboard-01 block template (hardcoded "Acme
 * Inc." branding, icon nav buttons, an avatar+dropdown with a dead "Account"
 * item). The sidebar and the top nav now render identically, not just link to
 * the same places.
 */
export function AppSidebar({ navItems, userLabel, ...props }: AppSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge />
          {isMobile && (
            <Button variant="ghost" className="w-fit shrink-0 translate-x-1/4" onClick={() => setOpenMobile(false)}>
              <XIcon className="size-6" />
              <span className="sr-only">Close menu</span>
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="gap-2 p-4">
        <NavUser label={userLabel} />
        <div className="pb-2 text-center">
          <small className="text-green-400">{siteConfig.name}</small>
          <Copyright />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
