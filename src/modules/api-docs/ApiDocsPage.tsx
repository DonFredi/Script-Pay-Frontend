import PageWrapper from "@/shared/components/shared/PageWrapper";
import Overview from "./sections/Overview";
import DocCard from "./sections/DocCard";

const ApiDocsPage = () => {
  return (
    <PageWrapper>
      <Overview />
      <DocCard />
    </PageWrapper>
  );
};
export default ApiDocsPage;
