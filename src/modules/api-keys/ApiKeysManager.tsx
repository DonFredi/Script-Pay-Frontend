"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { P } from "@/shared/components/ui/Typography";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "./useApiKeys";

const AVAILABLE_SCOPES = ["PAYMENTS_INITIATE", "PAYMENTS_READ", "RECONCILIATION_READ", "WEBHOOKS_MANAGE"];

/** Backend has had full create/list/revoke support since early on — nothing on
 * the frontend ever consumed it until now. */
export function ApiKeysManager() {
  const { data: keys, isLoading } = useApiKeys();
  const createKey = useCreateApiKey();
  const revokeKey = useRevokeApiKey();
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["PAYMENTS_INITIATE"]);
  const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null);

  function toggleScope(scope: string) {
    setSelectedScopes((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]));
  }

  async function handleCreate() {
    if (selectedScopes.length === 0) {
      toast.error("Select at least one scope");
      return;
    }
    try {
      const result = await createKey.mutateAsync(selectedScopes);
      // The raw key is only ever returned here, once — shown inline (not a toast
      // with a timeout) so it can't disappear before it's been copied.
      setJustCreatedKey(result.rawKey);
    } catch {
      toast.error("Could not create API key");
    }
  }

  async function handleRevoke(id: string) {
    try {
      await revokeKey.mutateAsync(id);
      toast.success("Key revoked");
    } catch {
      toast.error("Could not revoke key");
    }
  }

  return (
    <div className="space-y-6">
      {justCreatedKey && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="font-medium text-amber-900">Copy this key now — it won&apos;t be shown again</p>
          <code className="mt-2 block break-all rounded bg-white p-2 text-xs">{justCreatedKey}</code>
          <button onClick={() => setJustCreatedKey(null)} className="mt-2 text-xs text-muted-foreground underline">
            I&apos;ve copied it
          </button>
        </div>
      )}

      <div className="rounded-lg border p-4">
        <P className="font-medium">Create a new key</P>
        <div className="mt-3 flex flex-wrap gap-4">
          {AVAILABLE_SCOPES.map((scope) => (
            <label key={scope} className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={selectedScopes.includes(scope)} onChange={() => toggleScope(scope)} />
              {scope}
            </label>
          ))}
        </div>
        <Button onClick={handleCreate} disabled={createKey.isPending} className="mt-4">
          {createKey.isPending ? "Creating…" : "Create key"}
        </Button>
      </div>

      <div>
        <P className="mb-2 font-medium">Existing keys</P>
        {isLoading && <P className="text-muted-foreground">Loading…</P>}
        {!isLoading && !keys?.length && <P className="text-muted-foreground">No keys yet.</P>}
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
      </div>
    </div>
  );
}
