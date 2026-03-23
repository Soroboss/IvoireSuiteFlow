const plans = [
  {
    name: "STARTER",
    price: "19 900 FCFA/mois",
    recommended: false,
    features: ["1 etablissement", "<= 15 logements", "4 modes de reservation", "Rapports mensuels", "Support email", "14 jours d'essai gratuit"]
  },
  {
    name: "PRO",
    price: "39 900 FCFA/mois",
    recommended: true,
    features: [
      "1 etablissement",
      "Logements illimites",
      "4 modes de reservation",
      "Analytics avances + RevPAR",
      "Page de reservation en ligne",
      "Generation PDF (factures + contrats)",
      "Support WhatsApp prioritaire",
      "14 jours d'essai gratuit"
    ]
  },
  {
    name: "BUSINESS",
    price: "79 900 FCFA/mois",
    recommended: false,
    features: [
      "Multi-etablissements (illimite)",
      "Toutes les fonctionnalites Pro",
      "Comparaison inter-etablissements",
      "API & webhooks",
      "Support dedie 24/7",
      "Formation incluse (visio 1h)",
      "14 jours d'essai gratuit"
    ]
  }
];

export default function AdminPlansPage() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <article key={plan.name} className={`rounded-2xl border p-5 ${plan.recommended ? "border-isf-gold bg-isf-gold/10" : "border-isf-border bg-isf-bgCard"}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-isf-cream">{plan.name}</h2>
            {plan.recommended ? <span className="rounded-full bg-isf-gold px-2 py-1 text-xs font-semibold text-black">RECOMMANDE</span> : null}
          </div>
          <p className="mt-3 text-lg text-isf-gold">{plan.price}</p>
          <ul className="mt-4 space-y-2 text-sm text-isf-textSecondary">
            {plan.features.map((feature) => (
              <li key={feature}>- {feature}</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
