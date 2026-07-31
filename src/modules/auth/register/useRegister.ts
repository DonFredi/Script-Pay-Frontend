import { useMutation } from "@tanstack/react-query";
import type { RegisterInput } from "./register.schema";
import { register } from "./register.api";
import { toast } from "sonner";
import { authBreadcrumbs } from "@/shared/lib/sentry/sentry-breadcrumbs";
import { useAuthContext } from "@/providers/AuthProvider";

export const useRegister = () => {
  const { setSession } = useAuthContext();

  return useMutation({
    mutationFn: (data: RegisterInput) => register(data),
    onMutate: () => {
      authBreadcrumbs("User registration started");
    },
    onSuccess: (data) => {
      authBreadcrumbs("User registration successful", {
        userId: data.user.id,
        email: data.user.email,
      });
      // Establishes a real session immediately post-signup. RegisterForm still
      // redirects to /auth/verify-email — this doesn't skip that step, it just
      // means the person isn't stuck fully logged-out while waiting to verify.
      setSession(data.user, data.accessToken);
      toast.success("Account created successfully");
    },
    onError: (error) => {
      authBreadcrumbs("User registration failed");
      toast.error(error.message);
    },
  });
};
