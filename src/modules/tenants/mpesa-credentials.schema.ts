import { z } from "zod";

/**
 * The org-level Daraja app credentials only — Consumer Key/Secret. Everything
 * shortcode-specific (the Paybill/Till number itself, the STK passkey, B2C
 * initiator/security credential) now lives on a TenantShortcode instead — see
 * tenant-shortcodes.schema.ts. Safaricom issues one production app (one
 * Consumer Key/Secret pair) per organization at go-live, shared across every
 * shortcode that organization holds.
 */
export const mpesaCredentialsSchema = z.object({
  consumerKey: z.string().trim().min(1, "Consumer key is required"),
  consumerSecret: z.string().trim().min(1, "Consumer secret is required"),
});

export type MpesaCredentialsFormData = z.infer<typeof mpesaCredentialsSchema>;
