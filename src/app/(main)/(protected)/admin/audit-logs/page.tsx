"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listAuditLogs } from "@/modules/admin/audit-logs.api";
import { useTenants } from "@/modules/admin/useTenants";

/**
 * Optionally scoped to one tenant via ?tenantId= — AdminTenantDetailPage deep-links
 * here so platform staff can jump straight into a tenant's own audit trail during
 * incident response instead of scanning the full cross-tenant list.
 *
 * The Select below mirrors AdminTransactionsPage's tenant picker, but unlike
 * GET /v1/transactions, GET /v1/audit-logs doesn't require a tenantId for
 * SUPER_ADMIN callers — so "All tenants" is a valid default here rather than an
 * empty state the picker has to fill in, and there's no auto-select-first-tenant effect.
 */
const ALL_TENANTS_VALUE = "__all__";

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId") ?? undefined;
  const { data: tenants } = useTenants();
  const tenantName = tenantId ? (tenants?.find((t) => t.id === tenantId)?.name ?? tenantId) : null;

  function handleTenantChange(value: string) {
    const normalized = value === ALL_TENANTS_VALUE ? undefined : value;
    router.replace(normalized ? `/admin/audit-logs?tenantId=${normalized}` : "/admin/audit-logs");
  }

  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["admin", "audit-logs", tenantId],
    queryFn: () => listAuditLogs({ tenantId }),
  });

  const detailHref = (id: string) =>
    tenantId ? `/admin/audit-logs/${id}?tenantId=${tenantId}` : `/admin/audit-logs/${id}`;

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
        </div>

        <Select value={tenantId ?? ALL_TENANTS_VALUE} onValueChange={handleTenantChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All tenants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_TENANTS_VALUE}>All tenants</SelectItem>
            {tenants?.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isLoading && <P className="text-muted-foreground">Loading…</P>}
        {error && <P className="text-destructive">Could not load audit logs.</P>}
        {!isLoading && !error && !logs?.length && <P className="text-muted-foreground">No entries yet.</P>}

        {!!logs?.length && (
          <>
            {/* Below md, a wide row-per-line table forces overflow-x-auto, and on a
                real touchscreen a tap with any sideways finger drift gets read as
                that scroll gesture — the browser cancels the click and the row never
                navigates (see TransactionsTable for the same fix, first found there).
                A stacked card list has no competing scroll surface, so this doesn't
                come up. */}
            <div className="flex flex-col gap-3 md:hidden">
              {logs.map((log) => (
                <Link
                  key={log.id}
                  href={detailHref(log.id)}
                  className="block rounded-lg border bg-card p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-medium">{log.action}</span>
                    <span className="text-xs text-muted-foreground">{log.actorType}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>{log.targetType ? `${log.targetType}:${log.targetId?.slice(0, 8)}` : "—"}</span>
                    <span>{new Date(log.createdAt).toLocaleString("en-KE")}</span>
                  </div>
                </Link>
              ))}
            </div>

            <Table className="hidden md:table">
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
                  <TableRow key={log.id} className="relative">
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={detailHref(log.id)}
                        className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {log.action}
                      </Link>
                    </TableCell>
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
          </>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
