"use client";
import PageHeading from "@/shared/components/shared/PageHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { RegisterInput, registerSchema } from "../register.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Activity } from "react";
import FormError from "@/shared/components/shared/FormError";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { useRouter } from "next/navigation";
import { useRegister } from "../useRegister";

export default function RegisterForm() {
  const router = useRouter();
  const { mutateAsync, isPending, error } = useRegister();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegister: SubmitHandler<RegisterInput> = async (data) => {
    try {
      await mutateAsync(data);
      reset();
      router.replace(`/auth/verify-email?email=${data.email}`);
    } catch (err) {
    }
  };

  return (
    <SectionWrapper className="flex flex-col gap-4 items-center">
      <form onSubmit={handleSubmit(handleRegister)} className="w-full max-w-82 mx-auto">
        <FieldSet className="gap-6">
          <FieldLegend className="mx-auto mb-8">
            <PageHeading>Create Account</PageHeading>
          </FieldLegend>
          <Activity mode={error ? "visible" : "hidden"}>
            <FormError>{getErrorMessage(error)}</FormError>
          </Activity>
          <FieldGroup className="gap-3">
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="username"
                placeholder="you@example.com"
                {...register("username", { required: true })}
              />
              {errors.username && <FieldError>{errors.username.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: true })} />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
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
            {isPending ? "Signing up..." : "Sign up"}
          </Button>
        </FieldSet>
      </form>
      <p className="">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-medium text-lg underline">
          Log in
        </Link>
      </p>
    </SectionWrapper>
  );
}
