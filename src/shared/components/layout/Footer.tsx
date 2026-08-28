import Link from "next/link";
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
        <div className="flex flex-row items-center gap-4 text-sm text-slate-500">
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
        <Copyright />
      </SectionWrapper>
    </footer>
  );
}
