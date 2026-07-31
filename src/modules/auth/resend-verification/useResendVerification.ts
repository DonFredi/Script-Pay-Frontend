import { useMutation } from "@tanstack/react-query";
import { resendVerification } from "./resend-verification.api";
import { toast } from "sonner";

export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => resendVerification(email),
    onSuccess: () => {
      toast.success("Email verification sent successful");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
