import z from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email").trim().lowercase(),
  password: z.string("id field has to be a string").min(6, "Invalid password").max(100, "Invalid password"),
});

export type LoginInput = z.infer<typeof loginSchema>;
