import z from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(3, "Please enter a valid email").max(50, "Name too long").trim(),
    email: z.email("Please enter a valid email").trim().lowercase(),
    password: z
      .string("id field has to be a string")
      .min(6, "Password must be atleast 6 characters")
      .max(100, "Password too long"),
    confirmPassword: z.string(),
    /*  roles: z.array(z.enum(["admin", "member", "user"])).default(["user"]), */
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
