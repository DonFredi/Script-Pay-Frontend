import { Button } from "@/shared/components/ui/button";
import Shield from "../icons/Shield";
import Clock from "../icons/Clock";
import Code from "../icons/Code";
import SectionWrapper from "@/shared/components/shared/SectionWrapper";

const HeroSection = () => {
  return (
    <SectionWrapper className="flex flex-col md:flex-row">
      <div className="w-full  md:w-[50%] my-4">
        <span>🔔 Built for businesses</span>
        <h1>Accept M-Pesa payments in seconds</h1>
        <p>Powerful,secure and reliable API for STK Push, transaction tracking and real-time callbacks. </p>
        <div className="flex flex-row gap-4 my-4">
          <Button>Get Started</Button>
          <Button variant="secondary">View Docs</Button>
        </div>

        <div className="flex flex-row justify-start gap-4 my-10">
          <Shield />
          <Clock />
          <Code />
        </div>
      </div>
      <div className="w-full  md:w-[50%]">
        <img src="/images/hero_section_image.png" alt="hero_section_image" />
      </div>
    </SectionWrapper>
  );
};
export default HeroSection;
