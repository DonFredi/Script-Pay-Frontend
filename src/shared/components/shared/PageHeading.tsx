import { ReactNode } from "react";
import { H1 } from "../ui/Typography";
import { twMerge } from "tailwind-merge";

export default function PageHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <H1 className={twMerge("", className)}>{children}</H1>;
}
