"use client";

import { toast } from "sonner";
import { P } from "@/shared/components/ui/Typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTenantApiKeys, useRevokeTenantApiKey } from "@/modules/admin/useTenantApiKeys";

/**
 * Shared between AdminTenantApiKeysPage (arrived here already knowing the tenant,
 * e.g. from the tenant detail page) and AdminApiKeysPage (arrived here via the
 * top-level nav link and picks a tenant first) — same read + revoke oversight
 * table, just two different entry points into it.
 */
export function AdminApiKeysTable({ tenantId }: { tenantId: string }) {
  const { data: keys, isLoading, error } = useTenantApiKeys(tenantId);
  const revokeKey = useRevokeTenantApiKey(tenantId);

  async function handleRevoke(id: string) {
    try {
      await revokeKey.mutateAsync(id);
      toast.success("Key revoked");
    } catch {
      toast.error("Could not revoke key");
    }
  }

  return (
    <>
      {isLoading && <P className="text-muted-foreground">Loading…</P>}
      {error && <P className="text-destructive">Could not load API keys.</P>}
      {!isLoading && !error && !keys?.length && <P className="text-muted-foreground">No keys for this tenant.</P>}

      {!!keys?.length && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Scopes</TableHead>
              <TableHead>Last used</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="font-mono">{key.keyPrefix}…</TableCell>
                <TableCell className="text-xs text-muted-foreground">{key.scopes.join(", ")}</TableCell>
                <TableCell className="text-muted-foreground">
                  {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString("en-KE") : "Never"}
                </TableCell>
                <TableCell>{key.revokedAt ? "Revoked" : "Active"}</TableCell>
                <TableCell className="text-right">
                  {!key.revokedAt && (
                    <button onClick={() => handleRevoke(key.id)} className="text-xs text-destructive underline">
                      Revoke
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
