import type { ResetPasswordInput } from "./reset-password.schema";

export type ResetPasswordRequest = ResetPasswordInput & { token: string };
