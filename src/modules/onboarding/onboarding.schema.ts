import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Business name is too short").max(200),
  businessShortcode: z
    .string()
    .trim()
    .regex(/^\d{5,7}$/, "Must be a valid 5-7 digit Paybill/Till number"),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;
