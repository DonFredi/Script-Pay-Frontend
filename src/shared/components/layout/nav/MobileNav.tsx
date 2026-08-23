"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { useNavLinks } from "./useNavLinks";
import MobileNavLink from "./components/MobileNavLink";
import { Menu, XIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import Copyright from "@/shared/components/shared/Copyright";
import Badge from "../../shared/Badge";
import LogoutButton from "@/modules/auth/logout/components/LogoutButton";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const navLinks = useNavLinks();
  const { user, isAuthenticated } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} side="left" className="p-4 justify-between">
        <SheetHeader className="flex-row items-center p-0 justify-between">
          <SheetTitle asChild className="">
            <Badge />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription>
          <SheetClose asChild>
            <Button variant="ghost" className="w-fit translate-x-1/4">
              <XIcon className="size-6" />
            </Button>
          </SheetClose>
        </SheetHeader>
        <nav className="flex-1 flex flex-col justify-center">
          <ul className="flex flex-col gap-1 divide-y divide-slate-200">
            {navLinks.map((navLink) => (
              <li key={navLink.label} className="">
                <SheetClose asChild>
                  <MobileNavLink href={navLink.to} label={navLink.label} />
                </SheetClose>
              </li>
            ))}
          </ul>
          {isAuthenticated && (
            <p className="px-4 pt-2 text-sm text-muted-foreground truncate">Signed in as {user?.username ?? user?.email}</p>
          )}
          <LogoutButton onLoggedOut={() => setOpen(false)}>Log Out</LogoutButton>
        </nav>
        <SheetFooter className="text-center p-0">
          <small className="text-green-400">{siteConfig.name}</small>
          <Copyright />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
