import z from "zod";

export const resetPasswordSchema = z
  .object({
    password: z
      .string("id field has to be a string")
      .min(6, "Password must be atleast 6 characters")
      .max(100, "Password too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
