"use client";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { requireRoles } from "@/modules/auth/shared/guards/require-roles";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import Badge from "@/shared/components/shared/Badge";
import Copyright from "@/shared/components/shared/Copyright";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuth();
  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      // SUPER_ADMIN has no tenantId (see prisma schema) — sending them to the
      // tenant-scoped "/dashboard" would bounce them straight into /onboarding's
      // tenant-creation flow. Mirror LoginForm's own post-login role routing.
      router.replace(requireRoles(user?.roles, ["SUPER_ADMIN"]) ? "/admin/dashboard" : "/dashboard");
    }
  }, [isAuthenticated, isInitialized, user, router]);

  if (!isInitialized) return <FullScreenLoader />;
  if (isAuthenticated) return <FullScreenLoader/>;

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
