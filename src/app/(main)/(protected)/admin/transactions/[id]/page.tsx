import { TransactionDetailPage } from "@/modules/transactions/TransactionDetailPage";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return (
    <div>
      <TransactionDetailPage transactionId={id} backHref="/admin/transactions" />
    </div>
  );
};
export default page;
