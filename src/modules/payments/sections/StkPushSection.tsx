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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StkFormData>({
    resolver: zodResolver(stkPushSchema),
  });

  const { data: polledTransaction } = usePollTransactionStatus(activeTransactionId);

  // The success/failure message is only useful for a moment — once the request
  // has resolved, leaving it on screen indefinitely just clutters the form for
  // the next payment. Pending/waiting messages are left alone since they're
  // actively informing the merchant something is still in flight.
  useEffect(() => {
    if (status !== "success" && status !== "failed") return;
    const timeout = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timeout);
  }, [status]);

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

  const handleStkPush = async (data: StkFormData) => {
    setStatus("pending");
    setMessage("Sending STK push request...");

    try {
      const amountKes = Number(data.amount);
      const response = await initiateStkPush({
        msisdn: normalizeMsisdn(data.phone),
        amountMinorUnits: Math.round(amountKes * 100),
        accountReference: (data.accountNumber ?? "ScriptPay").slice(0, 12),
        transactionDesc: "Payment".slice(0, 13),
        // Determines which Daraja PIN prompt Safaricom shows the customer —
        // pay-bill style vs buy-goods style. The tenant's actual Paybill/Till
        // NUMBER isn't sent here at all; the backend looks that up from the
        // tenant's own configured shortcode, never from this form.
        channel: transactionType === "paybill" ? "PAYBILL" : transactionType === "till" ? "TILL" : undefined,
      });

      setActiveTransactionId(response.transactionId);
      setMessage("Awaiting confirmation...");
      const waitingTimeout = setTimeout(() => {
        setMessage("Still waiting... please enter your M-Pesa PIN on your phone.");
      }, 10000);
      void waitingTimeout;

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

            <Button type="submit">Send Prompt</Button>
          </FieldSet>
          {message && <div className="text-sm p-3 rounded bg-gray-100">{message}</div>}
        </form>
      </div>
      <RequestStatus status={status} />
    </SectionWrapper>
  );
};
export default StkPushSection;
