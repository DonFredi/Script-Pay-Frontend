import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type SectionProps = {
  children: ReactNode;
  className?: string;
};

export default function SectionWrapper({ children, className }: SectionProps) {
  return (
    <section
      className={twMerge(
        "w-[92%] md:w-[90%] mx-auto max-w-300 py-4",
        className,
      )}
    >
      {children}
    </section>
  );
}
