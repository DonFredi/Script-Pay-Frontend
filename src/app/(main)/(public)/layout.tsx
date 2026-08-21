import Footer from "@/shared/components/layout/Footer";
import Header from "@/shared/components/layout/Header";
import type { ReactNode } from "react";

// Marketing nav (Header/Navbar) and Footer live ONLY here, not in the shared
// (main) layout — protected routes (dashboard, admin, payments, etc.) already
// have their own AppSidebar-based nav in (protected)/(client)/layout.tsx and
// (protected)/admin/layout.tsx. Rendering the marketing Header there too used
// to stack public nav links (Home, Features, Pricing...) on top of the
// dashboard/admin sidebar nav on every protected page.
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex flex-col flex-1 gap-x-10 min-h-[80vh]">{children}</main>
      <Footer />
    </>
  );
}