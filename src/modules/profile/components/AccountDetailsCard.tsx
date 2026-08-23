import type { User } from "@/modules/auth/shared/types";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  TENANT_ADMIN: "Tenant Admin",
  TENANT_STAFF: "Tenant Staff",
};

/** Shared between the client's own /profile and the admin's /admin/profile — same account fields either way. */
export function AccountDetailsCard({ user }: { user: User }) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4">Account</h3>
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Username</dt>
          <dd>{user.username ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Role</dt>
          <dd>{user.roles.map((role) => ROLE_LABELS[role] ?? role).join(", ")}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">User ID</dt>
          <dd className="font-mono text-xs break-all">{user.id}</dd>
        </div>
      </dl>
    </div>
  );
}
