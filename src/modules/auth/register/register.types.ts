import type { User } from "../shared/types";

// Matches the backend's actual /auth/signup response (auth.controller.ts) — it
// returns the same shape as /auth/login (user + accessToken) so a fresh
// registration can establish a session immediately, without a separate login step.
export type RegisterDto = {
  user: User;
  accessToken: string;
};
