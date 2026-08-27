import PageWrapper from "@/shared/components/shared/PageWrapper";
import HeroSection from "./sections/HeroSection";
import FeaturesSection from "./sections/FeaturesSection";
import HowItWorks from "./sections/HowItWorks";
import SecuritySection from "./sections/SecuritySection";
import EaseOfUseSection from "./sections/EaseOfUseSection";
import FaqSection from "./sections/FaqSection";
import CtaSection from "./sections/CtaSection";

const HomePage = () => {
  return (
    <PageWrapper>
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <SecuritySection />
      <EaseOfUseSection />
      <FaqSection />
      <CtaSection />
    </PageWrapper>
  );
};
export default HomePage;
