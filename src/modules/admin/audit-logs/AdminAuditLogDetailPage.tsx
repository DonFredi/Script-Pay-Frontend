"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { getAuditLog } from "@/modules/admin/audit-logs.api";

/**
 * tenantId is only used to build the "back" link so it returns to the same
 * filtered list the row was clicked from — GET /v1/audit-logs/:id itself
 * doesn't take one, the backend scopes access to the fetched row's own
 * tenantId against the caller.
 */
export function AdminAuditLogDetailPage({ logId, tenantId }: { logId: string; tenantId?: string }) {
  const {
    data: log,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin", "audit-logs", "detail", logId],
    queryFn: () => getAuditLog(logId),
  });

  const backHref = tenantId ? `/admin/audit-logs?tenantId=${tenantId}` : "/admin/audit-logs";

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <Link href={backHref} className="text-sm text-muted-foreground underline">
            ← Audit logs
          </Link>
          <PageHeading>Audit log entry</PageHeading>
        </div>

        {isLoading && <P className="text-muted-foreground">Loading…</P>}
        {error && <P className="text-destructive">Could not load this audit log entry.</P>}

        {log && (
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-lg border bg-card p-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">Action</dt>
              <dd className="font-mono text-sm">{log.action}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">When</dt>
              <dd>{new Date(log.createdAt).toLocaleString("en-KE")}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Actor type</dt>
              <dd>{log.actorType}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Actor ID</dt>
              <dd className="font-mono text-xs break-all">{log.actorId ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Tenant ID</dt>
              <dd className="font-mono text-xs break-all">{log.tenantId ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Target</dt>
              <dd className="font-mono text-xs break-all">
                {log.targetType ? `${log.targetType}:${log.targetId ?? "—"}` : "—"}
              </dd>
            </div>
            {log.metadata && (
              <div className="col-span-full">
                <dt className="text-xs text-muted-foreground">Metadata</dt>
                <dd>
                  <pre className="mt-1 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </dd>
              </div>
            )}
          </dl>
        )}
      </SectionWrapper>
    </PageWrapper>
  );
}
