"use client";

import dynamic from "next/dynamic";
import SectionWrapper from "../shared/SectionWrapper";
import Navbar from "./nav/Navbar";
import LogoutButton from "@/modules/auth/logout/components/LogoutButton";
import Badge from "../shared/Badge";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
const MobileNav = dynamic(() => import("./nav/MobileNav"));

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="border-b">
      <SectionWrapper className="flex items-center justify-between">
        <Badge />
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <Navbar />
          {isAuthenticated && (
            <span className="text-sm text-muted-foreground truncate max-w-40">
              {user?.username ?? user?.email}
            </span>
          )}
          <LogoutButton>Log Out</LogoutButton>
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </SectionWrapper>
    </header>
  );
}
