"use client";

import { useCallback, useState } from "react";
import { getAccessToken } from "@/lib/auth/session";

type Block = { title: string; body: string; ok?: boolean };

export default function BackendTestPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  const push = useCallback((title: string, body: string, ok?: boolean) => {
    setBlocks((prev) => [...prev, { title, body, ok }]);
  }, []);

  const runHealth = async () => {
    setLoading("health");
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const json = await res.json();
      push("GET /api/health", JSON.stringify(json, null, 2), res.ok);
    } catch (e) {
      push("GET /api/health", e instanceof Error ? e.message : "Erreur", false);
    }
    setLoading(null);
  };

  const runMe = async () => {
    setLoading("me");
    const token = getAccessToken();
    if (!token) {
      push("GET /api/me", "Aucun token : connecte-toi depuis /login (session navigateur).", false);
      setLoading(null);
      return;
    }
    try {
      const res = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      push("GET /api/me", JSON.stringify(json, null, 2), res.ok);
    } catch (e) {
      push("GET /api/me", e instanceof Error ? e.message : "Erreur", false);
    }
    setLoading(null);
  };

  const runContext = async () => {
    setLoading("context");
    const token = getAccessToken();
    if (!token) {
      push("GET /api/context", "Aucun token : connecte-toi depuis /login.", false);
      setLoading(null);
      return;
    }
    try {
      const res = await fetch("/api/context", { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      push("GET /api/context", JSON.stringify(json, null, 2), res.ok);
    } catch (e) {
      push("GET /api/context", e instanceof Error ? e.message : "Erreur", false);
    }
    setLoading(null);
  };

  const runAdminSaas = async () => {
    setLoading("saas");
    const token = getAccessToken();
    if (!token) {
      push("GET /api/admin/saas", "Aucun token. Super Admin uniquement.", false);
      setLoading(null);
      return;
    }
    try {
      const res = await fetch("/api/admin/saas", { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      push("GET /api/admin/saas", JSON.stringify(json, null, 2), res.ok);
    } catch (e) {
      push("GET /api/admin/saas", e instanceof Error ? e.message : "Erreur", false);
    }
    setLoading(null);
  };

  return (
    <section className="space-y-4">
      <div>
        <h1 className="font-serif text-3xl text-isf-cream">Test backend</h1>
        <p className="text-sm text-isf-textSecondary">
          Vérifie InsForge, la session JWT et les routes API. Token présent :{" "}
          <span className="text-isf-gold">{getAccessToken() ? "oui" : "non"}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!!loading} onClick={runHealth} className="rounded-md bg-isf-gold px-3 py-2 text-sm font-medium text-black disabled:opacity-50">
          {loading === "health" ? "..." : "Santé (/api/health)"}
        </button>
        <button type="button" disabled={!!loading} onClick={runMe} className="rounded-md border border-isf-border px-3 py-2 text-sm text-isf-cream disabled:opacity-50">
          {loading === "me" ? "..." : "Session (/api/me)"}
        </button>
        <button type="button" disabled={!!loading} onClick={runContext} className="rounded-md border border-isf-border px-3 py-2 text-sm text-isf-cream disabled:opacity-50">
          {loading === "context" ? "..." : "Contexte (/api/context)"}
        </button>
        <button type="button" disabled={!!loading} onClick={runAdminSaas} className="rounded-md border border-isf-border px-3 py-2 text-sm text-isf-cream disabled:opacity-50">
          {loading === "saas" ? "..." : "Admin SaaS"}
        </button>
      </div>
      <p className="text-xs text-isf-textMuted">
        Admin SaaS nécessite <span className="text-isf-cream">profiles.role = super_admin</span>. Après inscription, exécute le SQL du dépôt :{" "}
        <code className="rounded bg-isf-bgElevated px-1">supabase/insforge/promote_super_admin_by_email.sql</code> dans le dashboard InsForge (remplace l’email).
      </p>

      <div className="space-y-3">
        {blocks.map((b, i) => (
          <article key={`${b.title}-${i}`} className="rounded-xl border border-isf-border bg-isf-bgCard p-4">
            <h2 className="text-sm font-semibold text-isf-cream">{b.title}</h2>
            <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-all text-xs text-isf-textSecondary">{b.body}</pre>
          </article>
        ))}
      </div>
    </section>
  );
}
