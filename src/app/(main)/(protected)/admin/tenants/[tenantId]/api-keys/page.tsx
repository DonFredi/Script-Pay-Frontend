import { AdminTenantApiKeysPage } from "@/modules/admin/tenants/AdminTenantApiKeysPage";

const page = async ({ params }: { params: Promise<{ tenantId: string }> }) => {
  const { tenantId } = await params;
  return (
    <div>
      <AdminTenantApiKeysPage tenantId={tenantId} />
    </div>
  );
};
export default page;
