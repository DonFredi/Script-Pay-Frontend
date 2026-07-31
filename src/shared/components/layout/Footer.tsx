import SectionWrapper from "../shared/SectionWrapper";
import Navbar from "./nav/Navbar";
import Copyright from "../shared/Copyright";
import Badge from "../shared/Badge";
import Developer from "../shared/Developer";

export default function Footer() {
  return (
    <footer>
      <SectionWrapper className="flex flex-col gap-4 items-center">
        <Badge />
        <Navbar />
        <Developer />
        <Copyright />
      </SectionWrapper>
    </footer>
  );
}
