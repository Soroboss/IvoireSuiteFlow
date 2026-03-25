import Link from "next/link";

export default function SettingsIndexPage() {
  return (
    <section className="space-y-4">
      <h1 className="font-serif text-3xl text-isf-cream">Paramètres</h1>
      <p className="text-sm text-isf-textSecondary">Configuration de l’établissement et outils techniques.</p>
      <Link href="/settings/backend-test" className="inline-block rounded-md border border-isf-border px-4 py-2 text-sm text-isf-gold hover:bg-isf-bgHover">
        Ouvrir la page de test backend
      </Link>
    </section>
  );
}
