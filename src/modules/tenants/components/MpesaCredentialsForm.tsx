"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { P } from "@/shared/components/ui/Typography";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { mpesaCredentialsSchema, type MpesaCredentialsFormData } from "../mpesa-credentials.schema";
import { useSetMpesaCredentials } from "../useMpesaCredentials";

/**
 * Lets a tenant configure their OWN Daraja credentials — required before any
 * payment can be initiated (StkPushService throws a clear "not configured"
 * error otherwise; there's no shared/fallback credential set in production).
 */
export function MpesaCredentialsForm() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MpesaCredentialsFormData>({
    resolver: zodResolver(mpesaCredentialsSchema),
  });

  const { mutateAsync, isPending } = useSetMpesaCredentials(user?.tenantId ?? "");

  const onSubmit = async (data: MpesaCredentialsFormData) => {
    await mutateAsync(data);
    // Clears the secret/passkey fields after a successful save — they're
    // never returned by the backend, so leaving stale values on screen would
    // be misleading (it isn't "still there", it's just not re-fetchable).
    reset({
      businessShortcode: data.businessShortcode,
      consumerKey: data.consumerKey,
      consumerSecret: "",
      passkey: "",
    });
  };

  if (!user?.tenantId) {
    return <p className="text-muted-foreground">Complete onboarding before configuring M-Pesa credentials.</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
      <FieldSet>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="businessShortcode">Paybill / Till Number</FieldLabel>
            <Input id="businessShortcode" placeholder="174379" {...register("businessShortcode")} />
            {errors.businessShortcode && <FieldError>{errors.businessShortcode.message}</FieldError>}
          </Field>

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

          <Field>
            <FieldLabel htmlFor="passkey">Passkey</FieldLabel>
            <PasswordInput id="passkey" {...register("passkey")} />
            {errors.passkey && <FieldError>{errors.passkey.message}</FieldError>}
          </Field>
        </FieldGroup>

        <P className="mt-2 text-xs text-muted-foreground">
          Get these from the{" "}
          <a href="https://developer.safaricom.co.ke" target="_blank" rel="noreferrer" className="underline">
            Safaricom Developer Portal
          </a>
          . Your secret and passkey are encrypted before storage and are never shown again after saving.
        </P>

        <Button type="submit" disabled={isPending} className="mt-4">
          {isPending ? "Saving…" : "Save credentials"}
        </Button>
      </FieldSet>
    </form>
  );
}
