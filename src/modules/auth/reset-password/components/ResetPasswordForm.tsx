"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/shared/components/ui/field";
import PageHeading from "@/shared/components/shared/PageHeading";
import { Activity } from "react";
import FormError from "@/shared/components/shared/FormError";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useResetPassword } from "../../reset-password/useResetPassword";
import { redirect, useSearchParams } from "next/navigation";
import { resetPasswordSchema, type ResetPasswordInput } from "../reset-password.schema";
import ResetPasswordSuccess from "./ResetPasswordSuccess";
import ResetPasswordError from "./ResetPasswordError";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { mutateAsync, isPending, error, isSuccess, isError } = useResetPassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const token = searchParams.get("token");
  if (!token) redirect("/auth/forgot-password");

  const handleResetPassword: SubmitHandler<ResetPasswordInput> = async (data) => {
    try {
      await mutateAsync({ ...data, token });
      reset();
    } catch (err) {
    }
  };

  if (isSuccess) return <ResetPasswordSuccess />;
  if (isError) return <ResetPasswordError />;

  return (
    <SectionWrapper className="flex flex-col gap-4 items-center">
      <form onSubmit={handleSubmit(handleResetPassword)} className="">
        <FieldSet className="gap-6">
          <FieldLegend className="mx-auto mb-6">
            <PageHeading>Reset Password</PageHeading>
          </FieldLegend>
          <Activity mode={error ? "visible" : "hidden"}>
            <FormError>{getErrorMessage(error)}</FormError>
          </Activity>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="password">New Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", { required: true })}
              />
              {errors.password && <FieldError>{errors.password.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword", { required: true })}
              />
              {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Reset..." : "Reset password"}
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
