"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { P } from "@/shared/components/ui/Typography";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { mpesaCredentialsSchema, type MpesaCredentialsFormData } from "../mpesa-credentials.schema";
import { useSetMpesaCredentials } from "../useMpesaCredentials";
import { createShortcodeSchema, SHORTCODE_TYPES, type CreateShortcodeFormData, type ShortcodeType } from "../tenant-shortcodes.schema";
import { useCreateShortcode, useRemoveShortcode, useTenantShortcodes } from "../useTenantShortcodes";

/**
 * Lets a tenant configure their OWN Daraja setup — required before any payment
 * can be initiated. Two independent pieces, matching the backend split:
 * 1. The shared, org-level Consumer Key/Secret (one Daraja app per organization).
 * 2. Any number of shortcodes (Till/Paybill/B2C) linked to that app, each with
 *    its own product-specific credentials.
 */
export function MpesaCredentialsForm() {
  const { user } = useAuth();

  if (!user?.tenantId) {
    return <p className="text-muted-foreground">Complete onboarding before configuring M-Pesa credentials.</p>;
  }

  return (
    <div className="max-w-2xl space-y-8">
      <AppCredentialsSection tenantId={user.tenantId} />
      <ShortcodesSection />
    </div>
  );
}

function AppCredentialsSection({ tenantId }: { tenantId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MpesaCredentialsFormData>({ resolver: zodResolver(mpesaCredentialsSchema) });

  const { mutateAsync, isPending } = useSetMpesaCredentials(tenantId);

  const onSubmit = async (data: MpesaCredentialsFormData) => {
    await mutateAsync(data);
    // The secret is never returned by the backend, so leaving a stale value on
    // screen would be misleading — clear it, keep the key visible.
    reset({ consumerKey: data.consumerKey, consumerSecret: "" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldSet>
        <h3 className="text-sm font-medium">App Credentials</h3>
        <P className="text-xs text-muted-foreground mb-2">
          One Consumer Key/Secret pair per Safaricom Daraja app — shared across every Till, Paybill, or B2C shortcode
          you add below.
        </P>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="consumerKey">Consumer Key</FieldLabel>
            <Input id="consumerKey" {...register("consumerKey")} />
            {errors.consumerKey && <FieldError>{errors.consumerKey.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="consumerSecret">Consumer Secret</FieldLabel>
            <PasswordInput id="consumerSecret" {...register("consumerSecret")} />
            {errors.consumerSecret && <FieldError>{errors.consumerSecret.message}</FieldError>}
          </Field>
        </FieldGroup>

        <P className="mt-2 text-xs text-muted-foreground">
          Get these from the{" "}
          <a href="https://developer.safaricom.co.ke" target="_blank" rel="noreferrer" className="underline">
            Safaricom Developer Portal
          </a>
          . Your secret is encrypted before storage and is never shown again after saving.
        </P>

        <Button type="submit" disabled={isPending} className="mt-4 w-fit">
          {isPending ? "Saving…" : "Save app credentials"}
        </Button>
      </FieldSet>
    </form>
  );
}

const SHORTCODE_TYPE_LABELS: Record<ShortcodeType, string> = {
  TILL: "Till (Buy Goods)",
  PAYBILL: "Paybill (Lipa na M-Pesa Online)",
  B2C: "B2C (payouts)",
};

function ShortcodesSection() {
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: shortcodes, isLoading } = useTenantShortcodes();
  const { mutateAsync: removeShortcode, isPending: isRemoving } = useRemoveShortcode();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Shortcodes</h3>
          <P className="text-xs text-muted-foreground">
            Add a Till, Paybill, or B2C-enabled shortcode. Most merchants hold more than one.
          </P>
        </div>
        {!showAddForm && (
          <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
            Add shortcode
          </Button>
        )}
      </div>

      {isLoading && <P className="mt-3 text-sm text-muted-foreground">Loading shortcodes…</P>}

      {shortcodes && shortcodes.length > 0 && (
        <ul className="mt-4 divide-y rounded-lg border">
          {shortcodes.map((sc) => (
            <li key={sc.id} className="flex items-center justify-between gap-4 p-3">
              <div>
                <p className="text-sm font-medium">
                  {sc.shortcode} <span className="text-muted-foreground">— {SHORTCODE_TYPE_LABELS[sc.type]}</span>
                  {sc.isDefault && <span className="ml-2 text-xs text-muted-foreground">(default)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sc.type === "B2C"
                    ? sc.payoutConfigured
                      ? "Payout credentials configured"
                      : "Payout credentials not yet configured"
                    : sc.stkConfigured
                      ? "STK credentials configured"
                      : "STK credentials not yet configured"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isRemoving}
                onClick={() => removeShortcode(sc.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      {showAddForm && <AddShortcodeForm onDone={() => setShowAddForm(false)} />}
    </div>
  );
}

function AddShortcodeForm({ onDone }: { onDone: () => void }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateShortcodeFormData>({
    resolver: zodResolver(createShortcodeSchema),
    defaultValues: { type: "PAYBILL" },
  });
  const { mutateAsync, isPending } = useCreateShortcode();
  // Local state drives the conditional fields below rather than react-hook-form's
  // watch() — watch() returns a function the React Compiler can't safely memoize,
  // and this value only exists to pick which fields to render.
  const [type, setType] = useState<ShortcodeType>("PAYBILL");

  const onSubmit = async (data: CreateShortcodeFormData) => {
    await mutateAsync({
      ...data,
      passkey: data.passkey || undefined,
      initiatorName: data.initiatorName || undefined,
      securityCredential: data.securityCredential || undefined,
    });
    onDone();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 rounded-lg border p-4">
      <FieldSet>
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="shortcode-type">Type</FieldLabel>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as ShortcodeType);
                setValue("type", v as ShortcodeType, { shouldValidate: true });
              }}
            >
              <SelectTrigger id="shortcode-type" className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {SHORTCODE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {SHORTCODE_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <FieldError>{errors.type.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="shortcode-number">Shortcode</FieldLabel>
            <Input id="shortcode-number" placeholder="174379" {...register("shortcode")} />
            {errors.shortcode && <FieldError>{errors.shortcode.message}</FieldError>}
          </Field>

          {type === "B2C" ? (
            <>
              <Field>
                <FieldLabel htmlFor="shortcode-initiatorName">Initiator Name</FieldLabel>
                <Input id="shortcode-initiatorName" {...register("initiatorName")} />
              </Field>
              <Field>
                <FieldLabel htmlFor="shortcode-securityCredential">Security Credential</FieldLabel>
                <PasswordInput id="shortcode-securityCredential" {...register("securityCredential")} />
              </Field>
              <P className="text-xs text-muted-foreground">
                The value Safaricom&apos;s portal gives you — your initiator password already encrypted against
                their certificate. Paste it exactly as provided.
              </P>
            </>
          ) : (
            <Field>
              <FieldLabel htmlFor="shortcode-passkey">Passkey</FieldLabel>
              <PasswordInput id="shortcode-passkey" {...register("passkey")} />
            </Field>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding…" : "Add shortcode"}
            </Button>
            <Button type="button" variant="ghost" onClick={onDone}>
              Cancel
            </Button>
          </div>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
