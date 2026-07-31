"use server";
import ContactEmailTemplate from "@/shared/components/email-template/templates/ContactEmailTemplate";
import { siteConfig } from "@/config/site";
import { ContactFormValues, contactSchema } from "@/shared/lib/validations/contact-schema";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactEmail(formData: ContactFormValues) {
  try {
    const validatedData = contactSchema.parse(formData);
    const { data, error } = await resend.emails.send({
      from: `${siteConfig.name} <onboarding@resend.dev>`,
      to: [siteConfig.contact.email.label],
      subject: "New contact form submission",
      replyTo: validatedData.email,
      react: ContactEmailTemplate({ formData: validatedData }),
    });

    if (error) {
      return {
        success: false,
        message: "Something went wrong, please try again",
        error: error,
      };
    }

    return {
      success: true,
      message: "Message sent successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong, please try again",
      error: error,
    };
  }
}
