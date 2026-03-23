export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
        <h2 className="font-serif text-2xl text-isf-cream">Super Admin SaaS</h2>
        <p className="text-sm text-isf-textSecondary">Pilotage global des abonnements IvoireSuiteFlow</p>
      </div>
      {children}
    </section>
  );
}
