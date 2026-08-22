import { AdminTenantDetailPage } from "@/modules/admin/tenants/AdminTenantDetailPage";

const page = async ({ params }: { params: Promise<{ tenantId: string }> }) => {
  const { tenantId } = await params;
  return (
    <div>
      <AdminTenantDetailPage tenantId={tenantId} />
    </div>
  );
};
export default page;
