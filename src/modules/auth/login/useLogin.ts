"use client";
import { useMutation } from "@tanstack/react-query";
import  { LoginInput } from "./login.schema";
import { login } from "./login.api";
import { useAuthContext } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { authBreadcrumbs } from "@/shared/lib/sentry/sentry-breadcrumbs";

export const useLogin = () => {
  const { setSession } = useAuthContext();

  return useMutation({
    mutationFn:  (data: LoginInput) => login(data),
    onMutate: () => {
      authBreadcrumbs("Login attempt started");
    },
    onSuccess: (data) => {
      authBreadcrumbs("Login successful", {
        userId: data.user.id,
        email: data.user.email,
      });
      // This call was previously commented out — AuthProvider's isAuthenticated
      // never became true after a "successful" login as a result. It's the actual
      // fix, not just an aesthetic uncomment.
      setSession(data.user, data.accessToken);
      toast.success("Login successful");
    },
    onError: (error) => {
      authBreadcrumbs("Login failed", {
        error: String(error),
      });
      toast.error(getErrorMessage(error));
    },
  });
};
