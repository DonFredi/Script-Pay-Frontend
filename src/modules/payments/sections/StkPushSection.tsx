"use client";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stkPushSchema } from "../stkPush.schema";
import { RequestStatus } from "../components/RequestStatus";
import { StkFormData } from "../stkPush.schema";
import { toast } from "sonner";
import type { StatusType } from "../StatusTypes";
import { initiateStkPush } from "../payments.api";
import { usePollTransactionStatus } from "../usePollTransactionStatus";
import { siteConfig } from "@/config/site";

type TransactionType = "stkPush" | "paybill" | "till";

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  stkPush: "STK Push",
  paybill: "Paybill",
  till: "Till",
};

/** Normalizes 07XX/01XX to Daraja's required 2547XX/2541XX format. */
function normalizeMsisdn(phone: string): string {
  if (phone.startsWith("0")) return `254${phone.slice(1)}`;
  return phone;
}

const StkPushSection = () => {
  const [transactionType, setTransactionType] = useState<TransactionType>("stkPush");
  const [status, setStatus] = useState<StatusType>("idle");
  const [message, setMessage] = useState("");
  const [activeTransactionId, setActiveTransactionId] = useState<string | null>(null);
  // Incremented once per submit to (re)arm the "still waiting" nudge. A counter
  // rather than a timestamp because Date.now() is impure and can't be called on the
  // render path; nothing here needs the actual time, only "a new attempt started".
  // Driving the nudge from state rather than a loose setTimeout is what lets the
  // effect below cancel it the moment the transaction resolves.
  const [waitingNudgeNonce, setWaitingNudgeNonce] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StkFormData>({
    resolver: zodResolver(stkPushSchema),
  });

  const { data: polledTransaction, hasStoppedPolling } = usePollTransactionStatus(activeTransactionId);

  // The success/failure message is only useful for a moment — once the request
  // has resolved, leaving it on screen indefinitely just clutters the form for
  // the next payment. Pending/waiting messages are left alone since they're
  // actively informing the merchant something is still in flight.
  useEffect(() => {
    if (status !== "success" && status !== "failed") return;
    const timeout = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timeout);
  }, [status]);

  // The "still waiting, enter your PIN" nudge. Only fires while the payment is
  // genuinely still in flight: the cleanup cancels it as soon as the status leaves
  // "pending", so a payment that resolves inside the ten seconds never sees it.
  useEffect(() => {
    if (waitingNudgeNonce === 0 || status !== "pending") return;
    const timeout = setTimeout(() => {
      setMessage("Still waiting... please enter your M-Pesa PIN on your phone.");
    }, 10000);
    return () => clearTimeout(timeout);
  }, [waitingNudgeNonce, status]);

  // Adjusted directly during render (React's recommended alternative to an
  // Effect here) rather than via useEffect+setState, so a new poll result
  // lands in the same commit instead of triggering an extra render pass.
  const [prevPolledTransaction, setPrevPolledTransaction] = useState(polledTransaction);
  if (polledTransaction !== prevPolledTransaction) {
    setPrevPolledTransaction(polledTransaction);

    if (polledTransaction) {
      if (polledTransaction.status === "SETTLED") {
        setStatus("success");
        setMessage("Payment successful!");
        setActiveTransactionId(null);
      } else if (polledTransaction.status === "FAILED" || polledTransaction.status === "REVERSED") {
        setStatus("failed");
        setMessage(polledTransaction.failureReason ?? "Transaction failed");
        setActiveTransactionId(null);
      } else {
        setStatus("pending");
      }
    }
  }

  // Polling gave up with the payment still unresolved. Say so and stop the spinner,
  // rather than leaving "Awaiting confirmation..." on screen against a hook that is
  // no longer asking. The payment isn't lost — the backend reconciles it — so this
  // points at where the answer will actually appear. Adjusted during render for the
  // same reason as the block above, not in an Effect.
  const [prevStoppedPolling, setPrevStoppedPolling] = useState(hasStoppedPolling);
  if (hasStoppedPolling !== prevStoppedPolling) {
    setPrevStoppedPolling(hasStoppedPolling);

    if (hasStoppedPolling && activeTransactionId) {
      setStatus("idle");
      setMessage(
        "Still unconfirmed after 5 minutes. We've stopped checking here — this payment will resolve on its own and appear in Transactions.",
      );
      setActiveTransactionId(null);
    }
  }

  const handleStkPush = async (data: StkFormData) => {
    setStatus("pending");
    setMessage("Sending STK push request...");

    try {
      const amountKes = Number(data.amount);
      const response = await initiateStkPush({
        msisdn: normalizeMsisdn(data.phone),
        amountMinorUnits: Math.round(amountKes * 100),
        accountReference: (data.accountNumber ?? siteConfig.name).slice(0, 12),
        transactionDesc: "Payment".slice(0, 13),
        // Determines which Daraja PIN prompt Safaricom shows the customer —
        // pay-bill style vs buy-goods style. The tenant's actual Paybill/Till
        // NUMBER isn't sent here at all; the backend looks that up from the
        // tenant's own configured shortcode, never from this form.
        channel: transactionType === "paybill" ? "PAYBILL" : transactionType === "till" ? "TILL" : undefined,
      });

      setActiveTransactionId(response.transactionId);
      setMessage("Awaiting confirmation...");
      // Tracked in state so the nudge can be CANCELLED. It used to be a bare
      // setTimeout assigned to a `void`-ed local, which nothing could clear — so a
      // payment that settled in two seconds still had its "Payment successful!"
      // message overwritten eight seconds later by "Still waiting... please enter
      // your M-Pesa PIN", telling the merchant a completed payment was stuck.
      setWaitingNudgeNonce((n) => n + 1);

      reset();
    } catch (error) {
      const msg = getErrorMessage(error);
      setMessage(msg);
      setStatus("failed");
      toast.error(msg);
    }
  };

  return (
    <SectionWrapper className="flex flex-col md:flex-row justify-between gap-6">
      <div className="flex flex-1 flex-col justify-start rounded-xl border bg-card p-6 shadow-sm">
        <h3>Initiate Payment</h3>
        <p className="text-muted-foreground">Send a payment prompt to collect from a customer</p>

        <ToggleGroup
          type="single"
          variant="outline"
          value={transactionType}
          onValueChange={(value) => value && setTransactionType(value as TransactionType)}
          className="my-4"
        >
          {(Object.keys(TRANSACTION_TYPE_LABELS) as TransactionType[]).map((type) => (
            <ToggleGroupItem key={type} value={type}>
              {TRANSACTION_TYPE_LABELS[type]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <form onSubmit={handleSubmit(handleStkPush)} className="max-w-full">
          <FieldSet>
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input id="phone" type="tel" placeholder="0700000000" {...register("phone", { required: true })} />
                {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="amount">Amount</FieldLabel>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  {...register("amount", { required: true })}
                />
                {errors.amount && <FieldError>{errors.amount.message}</FieldError>}
              </Field>

              {/* Only Paybill payments typically carry an account reference —
                  Till (buy goods) payments generally don't need one. */}
              {transactionType === "paybill" && (
                <Field>
                  <FieldLabel htmlFor="accountNumber">Account Number</FieldLabel>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter account number"
                    {...register("accountNumber", { required: true })}
                  />
                  {errors.accountNumber && <FieldError>{errors.accountNumber.message}</FieldError>}
                </Field>
              )}
            </FieldGroup>

            {/*
              Nothing disabled this before, and an STK push has no idempotency key
              the way a payout does — so a double-click sent two real prompts and the
              customer got two PIN requests for one purchase, either of which they
              could pay. Matches B2cPayoutSection's guard, which already worked this way.
            */}
            <Button type="submit" disabled={isSubmitting || status === "pending"}>
              {status === "pending" ? "Sending…" : "Send Prompt"}
            </Button>
          </FieldSet>
          {message && <div className="text-sm p-3 rounded bg-gray-100">{message}</div>}
        </form>
      </div>
      <RequestStatus status={status} />
    </SectionWrapper>
  );
};
export default StkPushSection;
