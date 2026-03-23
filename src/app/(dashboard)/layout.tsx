import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-isf-bgDeep">
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Header title="Tableau de bord" subtitle="Vue globale de vos opérations" />
          <main className="flex-1 p-4 pb-20 lg:p-6 lg:pb-6">{children}</main>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
