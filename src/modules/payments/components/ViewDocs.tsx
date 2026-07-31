"use client";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { useRouter } from "next/navigation";

const ViewDocs = () => {
  const router = useRouter();
  const handleDocs = () => {
    router.push("/api-docs");
  };
  return (
    <SectionWrapper className="shadow-lg flex flex-row justify-between px-6 py-10 mt-18">
      <div>
        <h4>Need Help?</h4>
        <p>Check out documentation or contact support</p>
      </div>

      <Button onClick={handleDocs}>View Docs</Button>
    </SectionWrapper>
  );
};
export default ViewDocs;
