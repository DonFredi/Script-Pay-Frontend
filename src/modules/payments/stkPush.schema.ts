import { z } from "zod";

export const stkPushSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(2547\d{8}|2541\d{8}|07\d{8}|01\d{8})$/, "Enter a valid Kenyan phone number"),

  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((value) => !isNaN(Number(value)), {
      message: "Amount must be a number",
    })
    .refine((value) => Number(value) > 0, {
      message: "Amount must be greater than 0",
    })
    // STK Push (Lipa na M-Pesa Online) is commonly documented as capped at KES
    // 150,000/transaction — lower than B2C's 250,000 (see b2c.schema.ts), since
    // Safaricom tariffs the two separately. Same role as that check: an obvious
    // over-limit typo caught before it reaches Safaricom, not a substitute for the
    // server's own limit (which may also vary per tenant's negotiated tariff) —
    // confirm the exact figure against current Daraja docs before launch.
    .refine((value) => Number(value) <= 150_000, {
      message: "A single STK push cannot exceed KES 150,000",
    }),

  // paybillNumber/tillNumber removed — a tenant's Paybill/Till number is THEIR
  // OWN business shortcode (configured once via POST /v1/tenants/:id/mpesa-credentials),
  // not something entered per-transaction. Only the account reference genuinely
  // varies per-payment.
  accountNumber: z
    .string()
    .trim()
    .min(3, "Account number is required")
    .max(30, "Account number is too long")
    .regex(/^[A-Za-z0-9_-]+$/, "Only letters, numbers, hyphens and underscores are allowed")
    .optional(),
});

export type StkFormData = z.infer<typeof stkPushSchema>;
