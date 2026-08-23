"use client";

import PageHeading from "@/shared/components/shared/PageHeading";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { P } from "@/shared/components/ui/Typography";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { AccountDetailsCard } from "@/modules/profile/components/AccountDetailsCard";

/** SUPER_ADMIN isn't scoped to a single tenant, so unlike the client's own
 * /profile there's no business details section here — just the account. */
export default function AdminProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>Profile</PageHeading>
          <P className="text-muted-foreground">Your platform admin account details.</P>
        </div>
        <AccountDetailsCard user={user} />
      </SectionWrapper>
    </PageWrapper>
  );
}
