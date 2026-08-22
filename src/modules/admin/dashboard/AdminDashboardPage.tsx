"use client";

import Link from "next/link";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTenants } from "@/modules/admin/useTenants";

/**
 * Previously: `export default function DashboardPage() { return <div><DashboardPage />
 * </div>; }` — a component rendering itself inside its own JSX, which would have
 * crashed the tab with infinite recursion on first visit. Replaced with a real
 * tenants overview, now brought in line with the rest of the app's shared
 * PageWrapper/SectionWrapper/Table components rather than raw HTML.
 */
export default function AdminDashboardPage() {
  const { data: tenants, isLoading, error } = useTenants();

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>Tenants</PageHeading>
          <P className="text-muted-foreground">All businesses on the platform.</P>
        </div>

        {isLoading && <P className="text-muted-foreground">Loading tenants…</P>}
        {error && <P className="text-destructive">Could not load tenants.</P>}
        {!isLoading && !error && !tenants?.length && <P className="text-muted-foreground">No tenants yet.</P>}

        {!!tenants?.length && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Shortcode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Onboarded</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/tenants/${tenant.id}`} className="hover:underline">
                      {tenant.name}
                    </Link>
                  </TableCell>
                  <TableCell>{tenant.businessShortcode}</TableCell>
                  <TableCell className="capitalize">{tenant.status.replace("_", " ")}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(tenant.createdAt).toLocaleDateString("en-KE")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/tenants/${tenant.id}/api-keys`} className="text-xs underline">
                      API keys
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
