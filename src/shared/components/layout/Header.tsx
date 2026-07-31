import dynamic from "next/dynamic";
import SectionWrapper from "../shared/SectionWrapper";
import Navbar from "./nav/Navbar";
import LogoutButton from "@/modules/auth/logout/components/LogoutButton";
import Badge from "../shared/Badge";
const MobileNav = dynamic(() => import("./nav/MobileNav"));

export default function Header() {
  return (
    <header className="">
      <SectionWrapper className="flex items-center justify-between">
        <Badge />
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <Navbar />
          <LogoutButton>Log Out</LogoutButton>
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </SectionWrapper>
    </header>
  );
}
