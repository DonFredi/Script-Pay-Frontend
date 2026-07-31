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
