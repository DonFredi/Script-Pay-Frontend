import { z } from "zod";

// Matches the backend's mpesaCredentialsSchema exactly (tenants.schema.ts).
const mpesaCredentialsBaseSchema = z.object({
  businessShortcode: z
    .string()
    .trim()
    .regex(/^\d{5,7}$/, "Shortcode must be 5 to 7 digits"),
  consumerKey: z.string().trim().min(1, "Consumer key is required"),
  consumerSecret: z.string().trim().min(1, "Consumer secret is required"),
  passkey: z.string().trim().min(1, "Passkey is required"),

  // B2C payout credentials — optional because collecting payments is the
  // common case. Supplying one without the other is rejected below, same as
  // the backend, so a half-entered payout section fails in the form instead
  // of at Safaricom.
  initiatorName: z.string().trim().min(1).optional().or(z.literal("")),
  securityCredential: z.string().trim().min(1).optional().or(z.literal("")),
});

export const mpesaCredentialsSchema = mpesaCredentialsBaseSchema.refine(
  (v) => Boolean(v.initiatorName) === Boolean(v.securityCredential),
  {
    message: "Initiator name and security credential must be provided together",
    path: ["initiatorName"],
  },
);

export type MpesaCredentialsFormData = z.infer<typeof mpesaCredentialsSchema>;
