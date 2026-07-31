import type { User } from "../shared/types";

// Matches the backend's actual /auth/login response exactly (see
// scriptpay-backend/src/modules/auth/auth.controller.ts). Firebase is gone —
// this is direct email+password now, verified by the backend itself.
export type LoginDto = {
  user: User;
  accessToken: string;
};
export type LoginRequest = {
  email: string;
  password: string;
};
