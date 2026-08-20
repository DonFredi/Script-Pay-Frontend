"use client";
import PageHeading from "@/shared/components/shared/PageHeading";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { LoginInput, loginSchema } from "../login.schema";
import {  useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLogin } from "../useLogin";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import FormError from "@/shared/components/shared/FormError";
import { Activity } from "react";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();
  const { mutateAsync, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginInput) => {
    try {
      // Firebase's ID-token round-trip is gone — this posts straight to the
      // backend, which verifies the password hash itself now.
      const response = await mutateAsync({ email: data.email, password: data.password });

      // SUPER_ADMIN and everyone else land in different areas — a hardcoded
      // "/dashboard" would send platform staff into the tenant-scoped area they
      // don't have access to, bouncing them straight to /unauthorized.
      const isSuperAdmin = response.user.roles.includes("SUPER_ADMIN");
      router.replace(isSuperAdmin ? "/admin/dashboard" : "/dashboard");
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err) || "Incorrect email or password");
      console.log("Login Error:", err);
    }
  };
  return (
    <SectionWrapper className="flex flex-col gap-4 items-center">
      <form onSubmit={handleSubmit(handleLogin)} className="w-full max-w-82 mx-auto">
        <FieldSet className="gap-6">
          <FieldLegend className="mx-auto mb-8">
            <PageHeading>Login</PageHeading>
          </FieldLegend>
          <Activity mode={error ? "visible" : "hidden"}>
            <FormError>{getErrorMessage(error)}</FormError>
          </Activity>
          <FieldGroup className="gap-3">
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
          </FieldGroup>
          <div className="flex flex-col gap-2 -mt-2">
            <Link href="/auth/forgot-password" className="text-end text-primary">
              Forgot Password?
            </Link>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Logging In..." : "Log in"}
            </Button>
          </div>
        </FieldSet>
      </form>
      <p className="">
        Do not have an account?{" "}
        <Link href="/auth/register" className="font-medium text-lg underline">
          Register
        </Link>
      </p>
    </SectionWrapper>
  );
}
