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
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    organization_name: "",
    organization_city: "",
    establishment_name: "",
    establishment_type: "hotel",
    establishment_address: "",
    establishment_neighborhood: "",
    establishment_city: "",
    establishment_units: "1"
  });
  const progress = useMemo(() => ((step + 1) / 3) * 100, [step]);

  const updateField = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isCurrentStepValid = () => {
    if (step === 0) return Boolean(form.full_name && form.email && form.phone && form.password);
    if (step === 1) return Boolean(form.organization_name && form.organization_city);
    return Boolean(form.establishment_name && form.establishment_address && form.establishment_neighborhood && form.establishment_city);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (step < 2) {
      if (!isCurrentStepValid()) {
        setError("Veuillez remplir tous les champs requis avant de continuer.");
        return;
      }
      setStep((v) => v + 1);
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name,
        phone: form.phone,
        organization_name: form.organization_name,
        organization_city: form.organization_city,
        establishment_name: form.establishment_name,
        establishment_type: form.establishment_type,
        establishment_address: form.establishment_address,
        establishment_neighborhood: form.establishment_neighborhood,
        establishment_city: form.establishment_city
      })
    });

    const json = (await res.json()) as { success?: boolean; message?: string };

    if (!res.ok || !json.success) {
      setLoading(false);
      setError(json.message ?? "Impossible de créer le compte pour le moment.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password
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
          <input name="full_name" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} placeholder="Nom complet" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} type="email" placeholder="Email" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="Téléphone" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} type="password" placeholder="Mot de passe" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
        </>
      )}

      {step === 1 && (
        <>
          <input name="organization_name" value={form.organization_name} onChange={(e) => updateField("organization_name", e.target.value)} placeholder="Nom de l'organisation" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="organization_city" value={form.organization_city} onChange={(e) => updateField("organization_city", e.target.value)} placeholder="Ville" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
        </>
      )}

      {step === 2 && (
        <>
          <input name="establishment_name" value={form.establishment_name} onChange={(e) => updateField("establishment_name", e.target.value)} placeholder="Nom de l'établissement" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <select name="establishment_type" value={form.establishment_type} onChange={(e) => updateField("establishment_type", e.target.value)} className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3">
            <option value="hotel">Hôtel</option>
            <option value="residence_meublee">Résidence meublée</option>
            <option value="auberge">Auberge</option>
            <option value="motel">Motel</option>
            <option value="maison_hotes">Maison d'hôtes</option>
            <option value="appart_hotel">Appart-hôtel</option>
          </select>
          <input name="establishment_address" value={form.establishment_address} onChange={(e) => updateField("establishment_address", e.target.value)} placeholder="Adresse" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="establishment_neighborhood" value={form.establishment_neighborhood} onChange={(e) => updateField("establishment_neighborhood", e.target.value)} placeholder="Quartier" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="establishment_city" value={form.establishment_city} onChange={(e) => updateField("establishment_city", e.target.value)} placeholder="Ville" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
          <input name="establishment_units" value={form.establishment_units} onChange={(e) => updateField("establishment_units", e.target.value)} type="number" min={1} placeholder="Nombre de chambres/logements" required className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
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
