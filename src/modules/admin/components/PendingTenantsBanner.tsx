"use client";
import Link from "next/link";
import { usePendingTenants } from "@/modules/admin/useTenants";

/**
 * Tells a SUPER_ADMIN, on every /admin page, that self-registered tenants are
 * waiting on KYC review. Without it a new sign-up only surfaces if the admin happens
 * to open the tenants list. In-app only — it can't reach an admin who isn't in the
 * dashboard (that needs a backend notification).
 */
export default function PendingTenantsBanner() {
  const { data: pending } = usePendingTenants();
  if (!pending || pending.length === 0) return null;

  const [first] = pending;
  const href = pending.length === 1 ? `/admin/tenants/${first.id}` : "/admin/dashboard";
  const label =
    pending.length === 1
      ? `${first.name} registered on ${new Date(first.createdAt).toLocaleDateString("en-KE")} and is waiting for KYC review.`
      : `${pending.length} tenants are waiting for KYC review (${pending.map((t) => t.name).join(", ")}).`;

  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm"
    >
      <span>{label}</span>
      <Link href={href} className="font-medium text-primary underline underline-offset-4">
        {pending.length === 1 ? "Review tenant" : "View tenants"}
      </Link>
    </div>
  );
}
