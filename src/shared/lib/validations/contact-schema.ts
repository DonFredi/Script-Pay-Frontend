import z from "zod";

export const contactSchema = z.object({
  name: z.string().min(3, "Name must be at least two characters"),
  email: z.string().email("Please enter a valid email").trim().lowercase(),
  message: z.string().min(10, "Message must be atleast 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
