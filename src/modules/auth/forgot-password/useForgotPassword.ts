import { useMutation } from "@tanstack/react-query";
import type { ForgotPasswordInput } from "./forgot-password.schema";
import { forgotPassword } from "./forgot-password.api";
import { toast } from "sonner";

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => forgotPassword(data),
    onSuccess: () => {
      toast.success("Email sent successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
