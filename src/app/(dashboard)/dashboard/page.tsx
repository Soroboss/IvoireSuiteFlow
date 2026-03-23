import { EmptyState } from "@/components/shared/EmptyState";

export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <EmptyState
        title="Dashboard IvoireSuiteFlow prêt"
        description="La structure est en place. Les KPI, graphiques et flux temps réel seront ajoutés au prochain sprint."
      />
    </section>
  );
}
