import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type SectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

// The one horizontal rule for every page: full width up to a 1440px cap, centred,
// with a fixed side gutter. Layouts and the components inside must not add their
// own horizontal padding/margin on top — the old w-[90%] column plus the
// dashboard <main>'s p-6 stacked two insets and squeezed cards into the middle.
export default function SectionWrapper({ children, className, id }: SectionProps) {
  return (
    <section
      id={id}
      className={twMerge(
        "w-full max-w-360 mx-auto px-4 md:px-6 py-4",
        className,
      )}
    >
      {children}
    </section>
  );
}
