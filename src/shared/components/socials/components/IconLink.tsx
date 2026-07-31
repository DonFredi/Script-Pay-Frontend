import { ReactNode } from "react";

export default function IconLink({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="p-1 w-fit ">
      {children}
    </a>
  );
}
