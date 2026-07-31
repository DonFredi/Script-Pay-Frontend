import type { UserRoles } from "../types";

export function requireRoles(userRoles: UserRoles[] | undefined, allowedRoles: UserRoles[]) {
  if (!userRoles) return false;
  return userRoles.some((role) => allowedRoles.includes(role));
}
