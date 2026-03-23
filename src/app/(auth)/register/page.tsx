"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const steps = ["Votre compte", "Votre entreprise", "Votre établissement"] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progress = useMemo(() => ((step + 1) / 3) * 100, [step]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);

    if (step < 2) {
      setStep((v) => v + 1);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("full_name") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const orgName = String(formData.get("organization_name") ?? "");
    const orgCity = String(formData.get("organization_city") ?? "");
    const estName = String(formData.get("establishment_name") ?? "");
    const estType = String(formData.get("establishment_type") ?? "hotel");
    const estAddress = String(formData.get("establishment_address") ?? "");
    const estNeighborhood = String(formData.get("establishment_neighborhood") ?? "");
    const estCity = String(formData.get("establishment_city") ?? "");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        full_name: fullName,
        phone,
        organization_name: orgName,
        organization_city: orgCity,
        establishment_name: estName,
        establishment_type: estType,
        establishment_address: estAddress,
        establishment_neighborhood: estNeighborhood,
        establishment_city: estCity
      })
    });

    const json = (await res.json()) as { success?: boolean; message?: string };

    if (!res.ok || !json.success) {
      setLoading(false);
      setError(json.message ?? "Impossible de créer le compte pour le moment.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    setLoading(false);
    if (signInError) {
      setError("Compte créé. Connectez-vous manuellement depuis la page de connexion.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs text-isf-textSecondary">
          <span>Étape {step + 1}/3</span>
          <span>{steps[step]}</span>
        </div>
        <div className="h-2 rounded-full bg-isf-bgElevated">
          <div className="h-2 rounded-full bg-isf-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 && (
        <>
          <input name="full_name" placeholder="Nom complet" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="email" type="email" placeholder="Email" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="phone" placeholder="Téléphone" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="password" type="password" placeholder="Mot de passe" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
        </>
      )}

      {step === 1 && (
        <>
          <input name="organization_name" placeholder="Nom de l'organisation" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="organization_city" placeholder="Ville" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
        </>
      )}

      {step === 2 && (
        <>
          <input name="establishment_name" placeholder="Nom de l'établissement" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <select name="establishment_type" className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3">
            <option value="hotel">Hôtel</option>
            <option value="residence_meublee">Résidence meublée</option>
            <option value="auberge">Auberge</option>
            <option value="motel">Motel</option>
            <option value="maison_hotes">Maison d'hôtes</option>
            <option value="appart_hotel">Appart-hôtel</option>
          </select>
          <input name="establishment_address" placeholder="Adresse" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="establishment_neighborhood" placeholder="Quartier" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="establishment_city" placeholder="Ville" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="establishment_units" type="number" min={1} placeholder="Nombre de chambres/logements" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
        </>
      )}

      {error ? <p className="text-sm text-isf-error">{error}</p> : null}

      <div className="flex gap-2">
        <button type="button" onClick={() => setStep((v) => Math.max(0, v - 1))} className="h-11 flex-1 rounded-md border border-isf-border" disabled={step === 0}>
          Retour
        </button>
        <button type="submit" disabled={loading} className="h-11 flex-1 rounded-md bg-isf-gold font-medium text-black">
          {loading ? "Création..." : step === 2 ? "Créer mon compte" : "Continuer"}
        </button>
      </div>
    </form>
  );
}
