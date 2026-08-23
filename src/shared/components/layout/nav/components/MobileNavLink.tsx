"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { ComponentProps } from "react";

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  label: string;
}

// Spreads {...props} onto the underlying Link — this is rendered as SheetClose's
// asChild child (see MobileNav.tsx), which clones this element and injects an
// onClick that closes the sheet. Without forwarding it, that onClick lands on
// this component's props and is silently dropped, so the sheet never closes.
export default function MobileNavLink({ href, label, className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "px-4 py-3 w-full rounded-sm inline-block hover:scale-105 duration-200 ease-in",
        isActive && "font-semibold text-primary",
        className,
      )}
      {...props}
    >
      {label}
    </Link>
  );
}
