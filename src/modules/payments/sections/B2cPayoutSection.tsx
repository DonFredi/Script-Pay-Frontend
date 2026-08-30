"use client";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { b2cSchema, type B2cFormData } from "../b2c.schema";
import { RequestStatus } from "../components/RequestStatus";
import type { StatusType } from "../StatusTypes";
import { formatKes } from "@/types";
import { initiateB2c } from "../payments.api";
import { usePollTransactionStatus } from "../usePollTransactionStatus";
import { useBalance } from "../useBalance";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";

/** Normalizes 07XX/01XX to Daraja's required 2547XX/2541XX format. */
function normalizeMsisdn(phone: string): string {
  if (phone.startsWith("0")) return `254${phone.slice(1)}`;
  return phone;
}

/**
 * Sends money OUT to a customer (Daraja B2C). Mirrors StkPushSection's shape, but
 * two things differ and both matter:
 *
 * 1. A successful response means Safaricom ACCEPTED THE REQUEST INTO ITS QUEUE, not
 *    that the money arrived — so this reports "processing" and polls, and never
 *    claims success off the back of the POST alone.
 * 2. The backend reserves the funds before calling Safaricom, so a payout larger
 *    than the tenant's balance is rejected with a 422 whose message carries both the
 *    requested and available amounts. That message is surfaced verbatim; it is the
 *    single most useful thing to show someone whose payout was declined.
 *
 * TENANT_ADMIN only — a TENANT_STAFF caller gets a 403 from the route, which arrives
 * here as an ordinary error message rather than a crash.
 */
const B2cPayoutSection = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<StatusType>("idle");
  const [message, setMessage] = useState("");
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  // Stable across retries of the SAME payout attempt (a hung/failed submit
  // resubmitted with the form still filled in) so the backend's
  // (tenantId, idempotencyKey) constraint recognizes it as a replay rather than a
  // second real disbursement — only rotated after an attempt actually succeeds.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<B2cFormData>({ resolver: zodResolver(b2cSchema) });

  const { data: polledTransaction } = usePollTransactionStatus(activeTransactionId);
  const { data: balance, refetch: refetchBalance } = useBalance();

  useEffect(() => {
    if (status !== "success" && status !== "failed") return;
    const timeout = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timeout);
  }, [status]);

  // Adjusted during render rather than in an Effect, matching StkPushSection — a new
  // poll result lands in the same commit instead of costing an extra render pass.
  const [prevPolled, setPrevPolled] = useState(polledTransaction);
  if (polledTransaction !== prevPolled) {
    setPrevPolled(polledTransaction);

    if (polledTransaction) {
      if (polledTransaction.status === "SETTLED") {
        setStatus("success");
        setMessage("Payout sent successfully.");
        setActiveTransactionId(null);
        // Settling a payout doesn't move tenant_balance further (it was already
        // debited on reservation), but a release-on-failure or a fresh collection
        // landing in the meantime would — refetch rather than let the figure go
        // stale until the next 10s poll.
        refetchBalance();
      } else if (polledTransaction.status === "FAILED" || polledTransaction.status === "REVERSED") {
        setStatus("failed");
        // The reservation is released automatically on failure, so the funds are
        // spendable again — worth saying, or the merchant assumes money is stuck.
        setMessage(polledTransaction.failureReason ?? "Payout failed. The reserved funds have been returned.");
        setActiveTransactionId(null);
        refetchBalance();
      } else {
        setStatus("pending");
      }
    }
  }

  const handlePayout = async (data: B2cFormData) => {
    setStatus("pending");
    setMessage("Sending payout request…");

    try {
      const response = await initiateB2c({
        msisdn: normalizeMsisdn(data.phone),
        amountMinorUnits: Math.round(Number(data.amount) * 100),
        remarks: data.remarks,
        occasion: data.occasion || undefined,
        idempotencyKey,
      });

      setActiveTransactionId(response.transactionId);
      setMessage("Payout accepted by Safaricom — awaiting confirmation…");
      reset();
      // This attempt succeeded — the next submission is a genuinely new payout, so
      // it needs a key of its own rather than reusing one the backend already has
      // a transaction recorded against.
      setIdempotencyKey(crypto.randomUUID());
      // The reservation debits tenant_balance as soon as the request is accepted,
      // before Safaricom's result callback ever arrives — refetch now rather than
      // show a stale "still spendable" figure while this payout is in flight.
      refetchBalance();
    } catch (error) {
      const msg = getErrorMessage(error);
      setMessage(msg);
      setStatus("failed");
      toast.error(msg);
    }
  };

  // Hidden for anyone but TENANT_ADMIN. This mirrors the route's @Roles("TENANT_ADMIN")
  // rather than replacing it — the server is still the thing enforcing this; hiding
  // the form just avoids offering TENANT_STAFF a button that can only ever 403.
  if (!user?.roles?.includes("TENANT_ADMIN")) return null;

  return (
    <SectionWrapper className="flex flex-col md:flex-row justify-between gap-6">
      <div className="flex flex-1 flex-col justify-start rounded-xl border bg-card p-6 shadow-sm">
        <h3>Send a Payout</h3>
        <p className="text-muted-foreground">
          Send money from your balance to a customer&apos;s M-Pesa number. The amount is held as soon as you submit.
        </p>
        <p className="mt-1 text-sm">
          Available balance:{" "}
          <span className="font-medium text-foreground">
            {balance ? formatKes(balance.availableMinorUnits) : "—"}
          </span>
        </p>

        <form onSubmit={handleSubmit(handlePayout)} className="mt-4 max-w-full">
          <FieldSet>
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="payout-phone">Recipient Phone Number</FieldLabel>
                <Input
                  id="payout-phone"
                  type="tel"
                  placeholder="0700000000"
                  {...register("phone", { required: true })}
                />
                {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="payout-amount">Amount</FieldLabel>
                <Input
                  id="payout-amount"
                  type="number"
                  placeholder="Enter amount"
                  {...register("amount", { required: true })}
                />
                {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="payout-remarks">Remarks</FieldLabel>
                <Input
                  id="payout-remarks"
                  type="text"
                  placeholder="e.g. Refund for order 42"
                  {...register("remarks", { required: true })}
                />
                {errors.remarks && <FieldError>{errors.remarks.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="payout-occasion">Occasion (optional)</FieldLabel>
                <Input id="payout-occasion" type="text" placeholder="Optional note" {...register("occasion")} />
                {errors.occasion && <FieldError>{errors.occasion.message}</FieldError>}
              </Field>

              <Button type="submit" className="mt-2" disabled={isSubmitting || status === "pending"}>
                {status === "pending" ? "Sending…" : "Send payout"}
              </Button>
            </FieldGroup>
          </FieldSet>
        </form>

        {status !== "idle" && <RequestStatus status={status} />}
        {message && <p className="mt-3 text-sm text-muted-foreground">{message}</p>}
      </div>
    </SectionWrapper>
  );
};

export default B2cPayoutSection;
