"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAuditLogs } from "@/modules/admin/audit-logs.api";
import { useTenants } from "@/modules/admin/useTenants";

/**
 * Didn't exist before — the second of two admin nav links pointing at a 404.
 *
 * Optionally scoped to one tenant via ?tenantId= — AdminTenantDetailPage deep-links
 * here so platform staff can jump straight into a tenant's own audit trail during
 * incident response instead of scanning the full cross-tenant list.
 */
export default function AdminAuditLogsPage() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId") ?? undefined;
  const { data: tenants } = useTenants();
  const tenantName = tenantId ? (tenants?.find((t) => t.id === tenantId)?.name ?? tenantId) : null;

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["admin", "audit-logs", tenantId],
    queryFn: () => listAuditLogs({ tenantId }),
  });

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>Audit Logs{tenantName ? ` — ${tenantName}` : ""}</PageHeading>
          <P className="text-muted-foreground">
            {tenantName
              ? "Every sensitive action and M-Pesa interaction for this tenant."
              : "Every sensitive action and M-Pesa interaction across the platform."}
          </P>
          {tenantName && (
            <Link href="/admin/audit-logs" className="text-sm text-muted-foreground underline">
              Clear filter — show all tenants
            </Link>
          )}
        </div>

        {isLoading && <P className="text-muted-foreground">Loading…</P>}
        {error && <P className="text-destructive">Could not load audit logs.</P>}
        {!isLoading && !error && !logs?.length && <P className="text-muted-foreground">No entries yet.</P>}

        {!!logs?.length && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.action}</TableCell>
                  <TableCell className="text-muted-foreground">{log.actorType}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.targetType ? `${log.targetType}:${log.targetId?.slice(0, 8)}` : "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("en-KE")}
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
