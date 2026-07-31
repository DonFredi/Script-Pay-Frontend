import Footer from "@/shared/components/layout/Footer";
import Header from "@/shared/components/layout/Header";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex flex-col flex-1 gap-x-10 min-h-[80vh]">
        {children}
        <Toaster position="top-center" />
      </main>
      <Footer />
    </>
  );
}
