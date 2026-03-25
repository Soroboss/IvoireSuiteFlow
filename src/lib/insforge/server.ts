import { createClient as createInsforgeClient } from "@insforge/sdk";

export function createServerInsforgeClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_INSFORGE_BASE_URL manquante");
  }

  return createInsforgeClient({
    baseUrl,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    isServerMode: true,
    // Optionnel: si tu stockes un access token InsForge côté cookies, tu peux
    // le passer ici par requête (plutôt que globalement).
    edgeFunctionToken: process.env.INSFORGE_EDGE_FUNCTION_TOKEN
  });
}

