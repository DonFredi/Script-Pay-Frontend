import { z } from "zod";

/**
 * Mirrors the backend's initiateB2cSchema. Kept separate from stkPushSchema rather
 * than shared: a payout has no account reference, requires remarks, and its amount
 * ceiling is a different number entirely (Safaricom tariffs B2C separately from STK).
 */
export const b2cSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^(2547\d{8}|2541\d{8}|07\d{8}|01\d{8})$/, "Enter a valid Kenyan phone number"),

  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((value) => !isNaN(Number(value)), { message: "Amount must be a number" })
    .refine((value) => Number(value) > 0, { message: "Amount must be greater than 0" })
    // The backend caps a single payout at KES 250,000. Checked here too so an obvious
    // over-limit typo is caught before it reaches Safaricom, not as a substitute for
    // the server check.
    .refine((value) => Number(value) <= 250_000, { message: "A single payout cannot exceed KES 250,000" }),

  // Required by Daraja, unlike the STK path's optional account reference.
  remarks: z.string().trim().min(1, "Remarks are required").max(100, "Remarks are too long"),

  occasion: z.string().trim().max(100, "Occasion is too long").optional(),
});

export type B2cFormData = z.infer<typeof b2cSchema>;
