import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function PageWrapper({ children, className }: SectionProps) {
  return (
    <section className={twMerge("flex flex-col flex-1 gap-x-10", className)}>
      {children}
    </section>
  );
}
