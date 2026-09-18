
import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>

      <main className="flex flex-col flex-1 gap-x-10 min-h-[80vh]">
        {children}
      </main>

    </>
  );
}
