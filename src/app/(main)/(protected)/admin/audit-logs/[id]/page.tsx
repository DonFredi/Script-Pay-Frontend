import { AdminAuditLogDetailPage } from "@/modules/admin/audit-logs/AdminAuditLogDetailPage";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tenantId?: string }>;
}) => {
  const { id } = await params;
  const { tenantId } = await searchParams;
  return <AdminAuditLogDetailPage logId={id} tenantId={tenantId} />;
};
export default page;
