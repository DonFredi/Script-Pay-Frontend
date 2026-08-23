"use client";

import LogoutButton from "@/modules/auth/logout/components/LogoutButton";
import { useSidebar } from "@/components/ui/sidebar";

/**
 * Rewritten from an avatar + dropdown menu (with a dead "Account" item that
 * linked nowhere) into the same identity-text + LogoutButton composition
 * Header.tsx (desktop) and MobileNav (mobile sheet) already use for the
 * public nav's signed-in state — this is that same footer, not a separate
 * design invented for the sidebar.
 */
export function NavUser({ label }: { label: string }) {
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <div className="flex flex-col gap-2 px-2 py-1">
      <p className="truncate px-2 text-sm text-muted-foreground">Signed in as {label}</p>
      <LogoutButton onLoggedOut={() => isMobile && setOpenMobile(false)}>Log Out</LogoutButton>
    </div>
  );
}
