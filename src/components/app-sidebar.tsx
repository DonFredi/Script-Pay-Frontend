"use client"

import * as React from "react"
import Link from "next/link"
import type { Icon } from "@tabler/icons-react"
import { IconInnerShadowTop } from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  brandLabel: string
  navItems: { title: string; url: string; icon?: Icon }[]
  user: { name: string; email: string; avatar: string }
}

/**
 * Rewritten from the shadcn dashboard-01 block template: that version hardcoded
 * "Acme Inc." branding, a fake logged-in user ("shadcn" / m@example.com), and
 * placeholder nav sections (Analytics/Projects/Team/Capture/Proposal/Prompts,
 * a "Data Library"/"Word Assistant" documents list) that had nothing to do with
 * this product and linked nowhere (url: "#" everywhere). This version takes real
 * nav items, a real user, and a real brand label as props — used by both
 * admin/layout.tsx and (client)/layout.tsx with different nav configs.
 */
export function AppSidebar({ brandLabel, navItems, user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">{brandLabel}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
