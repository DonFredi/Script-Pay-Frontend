"use client";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { ContactFormValues, contactSchema } from "@/shared/lib/validations/contact-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { sendContactEmail } from "../actions/send-contact-email";
import { toast } from "sonner";
import SectionHeading from "@/shared/components/shared/SectionHeading";

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    const response = await sendContactEmail(data);
    if (response.success) {
      reset();
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <SectionWrapper>
      <div className="w-full mx-auto max-w-90">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <FieldSet>
              <FieldLegend className="">
                <SectionHeading>Get in touch</SectionHeading>
              </FieldLegend>
              <FieldDescription>Send us a message and we'll get back to you as soon as possible</FieldDescription>
              {errors.root && <p className="text-lg font-semibold text-red-500">{errors.root.message}</p>}
              <FieldGroup className="gap-3">
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input id="name" placeholder="Enter fullname" {...register("name", { required: true })} />
                  {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register("email", { required: true })}
                  />
                  {errors.email && <FieldError>{errors.email.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="message">Message</FieldLabel>
                  <Textarea
                    id="message"
                    placeholder="Enter you message"
                    className="resize-none"
                    {...register("message", { required: true })}
                  />
                  {errors.message && <FieldError>{errors.message.message}</FieldError>}
                </Field>
              </FieldGroup>
            </FieldSet>

            <Field orientation="horizontal" className="justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </SectionWrapper>
  );
}
