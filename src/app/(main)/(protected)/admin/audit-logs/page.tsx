"use client";

import { useQuery } from "@tanstack/react-query";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAuditLogs } from "@/modules/admin/audit-logs.api";

/** Didn't exist before — the second of two admin nav links pointing at a 404. */
export default function AdminAuditLogsPage() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => listAuditLogs(),
  });

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <PageHeading>Audit Logs</PageHeading>
          <P className="text-muted-foreground">
            Every sensitive action and M-Pesa interaction across the platform.
          </P>
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
