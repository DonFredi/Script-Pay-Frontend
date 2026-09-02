import { z } from "zod";

export const SHORTCODE_TYPES = ["TILL", "PAYBILL", "B2C"] as const;
export type ShortcodeType = (typeof SHORTCODE_TYPES)[number];

// Matches the backend's createShortcodeSchema (tenant-shortcodes.schema.ts):
// TILL/PAYBILL need a passkey and no B2C fields; B2C needs an initiator name +
// security credential and no passkey.
const shortcodeBaseSchema = z.object({
  type: z.enum(SHORTCODE_TYPES),
  shortcode: z.string().trim().regex(/^\d{5,7}$/, "Shortcode must be 5 to 7 digits"),
  isDefault: z.boolean().optional(),
  passkey: z.string().trim().min(1).optional().or(z.literal("")),
  initiatorName: z.string().trim().min(1).optional().or(z.literal("")),
  securityCredential: z.string().trim().min(1).optional().or(z.literal("")),
});

export const createShortcodeSchema = shortcodeBaseSchema.refine(
  (v) => {
    if (v.type === "B2C") return Boolean(v.initiatorName) && Boolean(v.securityCredential) && !v.passkey;
    return Boolean(v.passkey) && !v.initiatorName && !v.securityCredential;
  },
  {
    message:
      "A Till/Paybill shortcode needs a passkey (and no B2C fields); a B2C shortcode needs an initiator name and " +
      "security credential (and no passkey)",
    path: ["type"],
  },
);

export type CreateShortcodeFormData = z.infer<typeof createShortcodeSchema>;
