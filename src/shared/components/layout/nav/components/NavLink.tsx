"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import type { ComponentProps } from "react";

interface NavLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  label: string;
}

export default function NavLink({ href, label, className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "px-4 py-2 rounded-sm inline-block hover:scale-105 duration-200 ease-in",
        isActive && "font-semibold text-primary",
        className,
      )}
      {...props}
    >
      {label}
    </Link>
  );
}
