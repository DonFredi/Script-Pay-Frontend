"use client";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import Badge from "@/shared/components/shared/Badge";
import Copyright from "@/shared/components/shared/Copyright";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuth();
  useEffect(() => {
    if (!isInitialized) return;
    if (isAuthenticated) {
      console.log("authenticated;", isAuthenticated);
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized) return <FullScreenLoader />;
  if (isAuthenticated) return null;

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
