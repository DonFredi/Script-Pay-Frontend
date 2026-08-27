"use client";
import { useMutation } from "@tanstack/react-query";
import { onboardTenant, type OnboardTenantRequest } from "./onboarding.api";
import { useAuthContext } from "@/providers/AuthProvider";
import { getCurrentUser } from "@/modules/auth/me/me.api";
import { toast } from "sonner";
import { getErrorMessage } from "@/shared/utils/get-error-message";
import { siteConfig } from "@/config/site";

export const useOnboardTenant = () => {
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: (data: OnboardTenantRequest) => onboardTenant(data),
    onSuccess: async () => {
      // onboardTenant() already refreshed the access token (it now carries the new
      // tenantId claim) — re-fetch the profile so the in-memory `user` object
      // reflects tenantId too. updateUser() only touches user state, never the
      // token, so there's no risk of clobbering the freshly-refreshed token here.
      const refreshedUser = await getCurrentUser();
      updateUser(refreshedUser);
      toast.success(`Tenant created — welcome to ${siteConfig.name}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
