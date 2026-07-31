import { ReactNode } from "react";
import { H2 } from "../ui/Typography";
import { twMerge } from "tailwind-merge";

export default function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <H2 className={twMerge("", className)}>{children}</H2>;
}
