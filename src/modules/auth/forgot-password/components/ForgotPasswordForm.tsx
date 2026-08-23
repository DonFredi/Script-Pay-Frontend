"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../forgot-password.schema";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/shared/components/ui/field";
import PageHeading from "@/shared/components/shared/PageHeading";
import { Activity } from "react";
import FormError from "@/shared/components/shared/FormError";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useForgotPassword } from "../useForgotPassword";

export default function ForgotPasswordForm() {
  const { mutateAsync, isPending, error } = useForgotPassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleForgotPassword: SubmitHandler<ForgotPasswordInput> = async (data) => {
    try {
      await mutateAsync(data);
      reset();
    } catch {
      // Error already surfaces via `error` from useForgotPassword, rendered below.
    }
  };

  return (
    <SectionWrapper className="flex flex-col gap-6 items-center">
      <form onSubmit={handleSubmit(handleForgotPassword)} className="form-narrow">
        <FieldSet className="gap-6">
          <FieldLegend className="mx-auto mb-3">
            <PageHeading>Forgot Password</PageHeading>
          </FieldLegend>
          <FieldDescription className="text-center">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </FieldDescription>
          <Activity mode={error ? "visible" : "hidden"}>
            <FormError>{getErrorMessage(error)}</FormError>
          </Activity>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: true })} />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Sending link..." : "Send reset link"}
          </Button>
        </FieldSet>
      </form>
      <Link href="/auth/login" className="font-medium flex items-center gap-3">
        <ChevronLeft />
        <span className="">Back to login</span>
      </Link>
    </SectionWrapper>
  );
}
