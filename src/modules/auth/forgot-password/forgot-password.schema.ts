import z from "zod";

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email").trim().lowercase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
