"use client";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { useTenant } from "@/modules/admin/useTenants";

/**
 * Explains a non-active tenant's state to the tenant themselves. A self-registered
 * tenant sits in "pending_kyc" until platform staff approve them, and nothing in the
 * dashboard said so — they just saw failed payments (the backend deliberately lets a
 * pending tenant initiate payments for testing, so the dashboard doesn't block them;
 * it only isn't approved for live use). GET /v1/tenants/:id allows a tenant to read
 * their own record, which is what this uses.
 */
export default function TenantStatusBanner() {
  const { user } = useAuth();
  const { data: tenant } = useTenant(user?.tenantId ?? "");
  if (!tenant) return null;

  if (tenant.status === "pending_kyc") {
    return (
      <div role="status" className="mb-6 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
        <p className="font-medium">Your account is awaiting approval</p>
        <p className="mt-1 text-muted-foreground">
          We&apos;re verifying your business before approving it for live use. Meanwhile you can set up your M-Pesa
          credentials in{" "}
          <Link href="/settings" className="font-medium text-primary underline underline-offset-4">
            Settings
          </Link>
          . Questions?{" "}
          <a href={siteConfig.contact.email.link} className="font-medium text-primary underline underline-offset-4">
            {siteConfig.contact.email.label}
          </a>
          .
        </p>
      </div>
    );
  }

  if (tenant.status === "suspended" || tenant.status === "removed") {
    return (
      <div role="alert" className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
        <p className="font-medium text-destructive">
          Your account is {tenant.status === "suspended" ? "suspended" : "deactivated"}
        </p>
        <p className="mt-1 text-muted-foreground">
          Payments are disabled until this is resolved. Please contact{" "}
          <a href={siteConfig.contact.email.link} className="font-medium text-primary underline underline-offset-4">
            {siteConfig.contact.email.label}
          </a>
          .
        </p>
      </div>
    );
  }

  return null;
}
