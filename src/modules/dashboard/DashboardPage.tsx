"use client";

import Link from "next/link";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";

/**
 * Previously imported and rendered the ADMIN dashboard component
 * (`../../admin/dashboard/page`) — meaning any regular tenant visiting /dashboard
 * saw (or was blocked by a 403 from) the SUPER_ADMIN-only tenants overview,
 * not their own dashboard. This is a real, standalone tenant landing page instead.
 * Kept light on purpose — full payment initiation + transaction history already
 * live at /payments, no need to duplicate that content here.
 */
export default function ClientDashboardPage() {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-4">
        <div>
          <PageHeading>Welcome back</PageHeading>
          <P className="text-muted-foreground">{user?.email}</P>
        </div>
        <Link href="/payments" className="inline-block text-sm font-medium text-primary underline underline-offset-4">
          Go to payments →
        </Link>
      </SectionWrapper>
    </PageWrapper>
  );
}
