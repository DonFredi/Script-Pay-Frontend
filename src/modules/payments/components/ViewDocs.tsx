import SectionWrapper from "@/shared/components/shared/SectionWrapper";
import { Button } from "@/shared/components/ui/button";
import { siteConfig } from "@/config/site";

// Used to link to /api-docs — that page was intentionally removed (see
// CLAUDE.md, 2026-08-21), so this points at a real, staffed contact channel
// instead of a dead route.
const ViewDocs = () => {
  return (
    <SectionWrapper className="shadow-lg flex flex-row justify-between px-6 py-10 mt-18">
      <div>
        <h4>Need Help?</h4>
        <p>Talk to us and we&apos;ll walk you through it</p>
      </div>

      <Button asChild>
        <a href={siteConfig.contact.phone.link}>Call Us</a>
      </Button>
    </SectionWrapper>
  );
};
export default ViewDocs;
