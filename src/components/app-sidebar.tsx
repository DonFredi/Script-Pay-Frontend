"use client"

import * as React from "react"
import Link from "next/link"
import type { Icon } from "@tabler/icons-react"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { XIcon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
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
  // On mobile the sidebar renders as a Sheet with its default close button
  // suppressed (see ui/sidebar.tsx) so this can supply one styled to match the
  // marketing nav's MobileNav — same ghost/XIcon/size-6 close button, in the
  // same header row as the brand — instead of the two menus looking unrelated.
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center justify-between gap-2">
            <SidebarMenuButton
              asChild
              className="w-auto flex-1 data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">{brandLabel}</span>
              </Link>
            </SidebarMenuButton>
            {isMobile && (
              <Button
                variant="ghost"
                className="w-fit shrink-0 translate-x-1/4"
                onClick={() => setOpenMobile(false)}
              >
                <XIcon className="size-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            )}
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
