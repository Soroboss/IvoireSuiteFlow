"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const email = String(form.get("email") ?? "");
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`
    });
    setMessage("Si cet email existe, un lien de réinitialisation a été envoyé.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-isf-textSecondary">Entrez votre email pour recevoir un lien de réinitialisation.</p>
      <input name="email" type="email" required placeholder="Email" className="h-11 w-full rounded-md border border-isf-border bg-isf-bgElevated px-3" />
      <button className="h-11 w-full rounded-md bg-isf-gold font-medium text-black">Envoyer le lien</button>
      {message ? <p className="text-sm text-isf-success">{message}</p> : null}
    </form>
  );
}
