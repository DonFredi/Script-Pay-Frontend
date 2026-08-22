"use client";

import Link from "next/link";
import { toast } from "sonner";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import PageHeading from "@/shared/components/shared/PageHeading";
import { P } from "@/shared/components/ui/Typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTenants } from "@/modules/admin/useTenants";
import { useTenantApiKeys, useRevokeTenantApiKey } from "@/modules/admin/useTenantApiKeys";

/**
 * SUPER_ADMIN oversight of one tenant's API keys — read + revoke only. There is no
 * create form here on purpose: key issuance stays tenant self-service (see
 * docs/decisions.md); this page exists so platform staff can audit or kill a key
 * during an incident without needing tenant credentials.
 */
export function AdminTenantApiKeysPage({ tenantId }: { tenantId: string }) {
  const { data: tenants } = useTenants();
  const { data: keys, isLoading, error } = useTenantApiKeys(tenantId);
  const revokeKey = useRevokeTenantApiKey(tenantId);

  const tenantName = tenants?.find((t) => t.id === tenantId)?.name ?? tenantId;

  async function handleRevoke(id: string) {
    try {
      await revokeKey.mutateAsync(id);
      toast.success("Key revoked");
    } catch {
      toast.error("Could not revoke key");
    }
  }

  return (
    <PageWrapper>
      <SectionWrapper className="space-y-6">
        <div>
          <Link href={`/admin/tenants/${tenantId}`} className="text-sm text-muted-foreground underline">
            ← {tenantName}
          </Link>
          <PageHeading>API keys — {tenantName}</PageHeading>
          <P className="text-muted-foreground">Read-only oversight. Revoke here only for incident response.</P>
        </div>

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
      </SectionWrapper>
    </PageWrapper>
  );
}
