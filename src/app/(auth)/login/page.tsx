"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const supabase = createClient();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push("/dashboard");
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm text-isf-textSecondary">Email</label>
        <input name="email" type="email" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
      </div>
      <div>
        <label className="mb-1 block text-sm text-isf-textSecondary">Mot de passe</label>
        <input name="password" type="password" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
      </div>
      {error ? <p className="text-sm text-isf-error">{error}</p> : null}
      <button disabled={loading} className="h-11 w-full rounded-md bg-isf-gold font-medium text-black disabled:opacity-60">
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="text-isf-textSecondary hover:text-isf-cream">Mot de passe oublié ?</Link>
        <Link href="/register" className="text-isf-gold">Créer un compte</Link>
      </div>
    </form>
  );
}
