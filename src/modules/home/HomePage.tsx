import PageWrapper from "@/shared/components/shared/PageWrapper";
import HeroSection from "./sections/HeroSection";
import FeatureCard from "./components/FeatureCard";
import HowItWorks from "./sections/HowItWorks";

const HomePage = () => {
  return (
    <PageWrapper>
      <HeroSection />
      <FeatureCard />
      <HowItWorks />
    </PageWrapper>
  );
};
export default HomePage;
