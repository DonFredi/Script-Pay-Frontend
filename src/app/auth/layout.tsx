"use client";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { requireRoles } from "@/modules/auth/shared/guards/require-roles";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import Badge from "@/shared/components/shared/Badge";
import Copyright from "@/shared/components/shared/Copyright";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isInitialized } = useAuth();
  // Sole place that redirects an already-authenticated visitor away from
  // /auth/* — login/register no longer also call router.replace() themselves
  // after success, which used to race this effect (two navigations off one
  // login/register, and on register specifically, this redirect could win
  // and bounce a freshly-registered user to the dashboard instead of the
  // verify-email page they were just sent to).
  useEffect(() => {
    if (!isInitialized) return;
    // A freshly-registered (but not yet email-verified) user IS authenticated
    // per this app's session model — they still need to reach this page.
    if (pathname === "/auth/verify-email") return;
    if (isAuthenticated) {
      // SUPER_ADMIN has no tenantId (see prisma schema) — sending them to the
      // tenant-scoped "/dashboard" would bounce them straight into /onboarding's
      // tenant-creation flow. Mirror LoginForm's own post-login role routing.
      router.replace(requireRoles(user?.roles, ["SUPER_ADMIN"]) ? "/admin/dashboard" : "/dashboard");
    }
  }, [isAuthenticated, isInitialized, pathname, user, router]);

  if (!isInitialized) return <FullScreenLoader />;
  if (isAuthenticated && pathname !== "/auth/verify-email") return <FullScreenLoader />;

  return (
    <>
      <header className="">
        <SectionWrapper>
          <Badge />
        </SectionWrapper>
      </header>
      <main className="flex flex-col flex-1 gap-x-10 items-center justify-center">{children}</main>
      <footer className="">
        <SectionWrapper className="text-center">
          <Copyright />
        </SectionWrapper>
      </footer>
    </>
  );
}
