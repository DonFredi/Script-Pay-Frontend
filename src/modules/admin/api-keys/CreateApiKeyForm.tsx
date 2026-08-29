"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { P } from "@/shared/components/ui/Typography";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { useCreateTenantApiKey } from "@/modules/admin/useTenantApiKeys";
import {
  API_KEY_SCOPES,
  API_KEY_SCOPE_DESCRIPTIONS,
  DANGEROUS_SCOPES,
  type ApiKeyScope,
  type CreatedApiKey,
} from "@/modules/admin/api-keys.api";

/**
 * Key creation did not exist in this UI before — the module was list-and-revoke
 * only, on the assumption that activation auto-provisions the one key a tenant
 * needs. That holds for collecting payments, but PAYMENTS_DISBURSE is deliberately
 * excluded from the auto-provisioned set, so without this form the only way to
 * enable payouts for a tenant is calling the API by hand.
 *
 * The raw key is shown exactly once. The backend stores an argon2 hash and cannot
 * return it again, so the copy step below is the user's only chance.
 */
export function CreateApiKeyForm({ tenantId }: { tenantId: string }) {
  const [selected, setSelected] = useState<ApiKeyScope[]>([]);
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { mutateAsync, isPending } = useCreateTenantApiKey(tenantId);

  const grantsPayouts = selected.some((scope) => DANGEROUS_SCOPES.includes(scope));

  function toggle(scope: ApiKeyScope) {
    setSelected((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]));
  }

  async function handleCreate() {
    setError("");
    try {
      const key = await mutateAsync({ scopes: selected });
      setCreated(key);
      setSelected([]);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }

  async function handleCopy() {
    if (!created) return;
    await navigator.clipboard.writeText(created.rawKey);
    setCopied(true);
  }

  if (created) {
    return (
      <div className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <P className="font-medium text-amber-900">Copy this key now — it will never be shown again.</P>
        <code className="block break-all rounded bg-white p-3 font-mono text-sm">{created.rawKey}</code>
        <P className="text-sm text-amber-900">Scopes: {created.scopes.join(", ")}</P>
        <div className="flex gap-2">
          <Button type="button" onClick={handleCopy}>
            {copied ? "Copied" : "Copy key"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setCreated(null)}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div>
        <P className="font-medium">Issue a new API key</P>
        <P className="text-sm text-muted-foreground">
          Pick only the scopes this integration needs — a leaked key can do exactly what you tick here.
        </P>
      </div>

      <div className="space-y-2">
        {API_KEY_SCOPES.map((scope) => (
          <label key={scope} className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={selected.includes(scope)}
              onCheckedChange={() => toggle(scope)}
              aria-label={scope}
              className="mt-0.5"
            />
            <span>
              <span className="font-mono">{scope}</span>
              <span className="block text-muted-foreground">{API_KEY_SCOPE_DESCRIPTIONS[scope]}</span>
            </span>
          </label>
        ))}
      </div>

      {/* Payouts are the one capability that moves money away from the tenant, so
          ticking it gets an explicit warning rather than sitting silently in a list. */}
      {grantsPayouts && (
        <div className="rounded border border-destructive/40 bg-destructive/5 p-3 text-sm">
          This key will be able to <strong>send money out</strong> of the tenant&apos;s balance. Issue it only to an
          integration that genuinely needs to make payouts.
        </div>
      )}

      {error && <P className="text-sm text-destructive">{error}</P>}

      <Button type="button" onClick={handleCreate} disabled={selected.length === 0 || isPending}>
        {isPending ? "Creating…" : "Create key"}
      </Button>
      {selected.length === 0 && <P className="text-xs text-muted-foreground">Select at least one scope.</P>}
    </div>
  );
}
