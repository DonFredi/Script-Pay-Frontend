import type { ReactNode } from "react";

export default function FormError({ children }: { children: ReactNode }) {
  return <div className="bg-red-100 text-destructive rounded-sm px-4 py-2.5 font-medium">{children}</div>;
}
