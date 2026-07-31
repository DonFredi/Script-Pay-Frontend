"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import FullScreenLoader from "@/shared/components/layout/FullScreenLoader";
import OnboardingPage from "@/modules/onboarding/OnboardingPage";

// Auth itself is already enforced one level up by (protected)/layout.tsx — this
// page only adds one extra rule: a tenant who's already onboarded has nothing to
// do here and should land on their real dashboard instead.
export default function Onboarding() {
  const router = useRouter();
  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && user?.tenantId) {
      router.replace("/dashboard");
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) return <FullScreenLoader />;
  if (user?.tenantId) return null;

  return <OnboardingPage />;
}
