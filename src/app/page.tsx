import Link from "next/link";
import { ISFLogo } from "@/components/shared/ISFLogo";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-isf-cream text-slate-900">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 text-center">
        <ISFLogo className="text-4xl" />
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Simplifiez vos opérations, valorisez vos établissements.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/login" className="rounded-md bg-slate-900 px-4 py-2 text-white">Se connecter</Link>
          <Link href="/register" className="rounded-md border border-slate-300 px-4 py-2">Créer un compte</Link>
        </div>
      </section>
    </main>
  );
}
