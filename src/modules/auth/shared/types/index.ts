// Matches the backend's Prisma `Role` enum exactly (see prisma/schema.prisma in
// scriptpay-backend) — these are not generic placeholder names, they're the real
// authorization roles the access token's JWT claims and GET /profile both return.
export type UserRoles = "SUPER_ADMIN" | "TENANT_ADMIN" | "TENANT_STAFF";

export type User = {
  id: string;
  username: string | null;
  email: string;
  roles: UserRoles[];
  tenantId: string | null; // null means onboarding (tenant provisioning) hasn't happened yet
};

/* export type ForgotPasswordDto = {
  email: string;
};
 */
