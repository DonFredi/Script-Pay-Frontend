"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PageWrapper from "@/shared/components/shared/PageWrapper";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { onboardingSchema, type OnboardingFormData } from "./onboarding.schema";
import { useOnboardTenant } from "./useOnboardTenant";

/**
 * Was a literal empty <div></div> before — the actual form was never built,
 * even though onboarding.api.ts, onboarding.schema.ts, and useOnboardTenant.ts
 * (the token-refresh-aware mutation hook) were already correctly wired up
 * underneath it.
 */
const OnboardingPage = () => {
  const router = useRouter();
  const { mutateAsync, isPending, error } = useOnboardTenant();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: OnboardingFormData) => {
    await mutateAsync(data);
    router.replace("/dashboard");
  };

  return (
    <PageWrapper>
      <SectionWrapper className="mx-auto max-w-lg py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Set up your business</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your business so we can start processing payments for you.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <FieldSet>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="name">Business name</FieldLabel>
                <Input id="name" placeholder="Acme Traders Ltd" {...register("name")} />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="businessShortcode">Paybill / Till number</FieldLabel>
                <Input
                  id="businessShortcode"
                  placeholder="174379"
                  inputMode="numeric"
                  {...register("businessShortcode")}
                />
                {errors.businessShortcode && <FieldError>{errors.businessShortcode.message}</FieldError>}
              </Field>
            </FieldGroup>

            {error && <p className="mt-2 text-sm text-destructive">{(error as Error).message}</p>}

            <Button type="submit" disabled={isPending} className="mt-6 w-full">
              {isPending ? "Setting up…" : "Continue"}
            </Button>
          </FieldSet>
        </form>
      </SectionWrapper>
    </PageWrapper>
  );
};
export default OnboardingPage;
