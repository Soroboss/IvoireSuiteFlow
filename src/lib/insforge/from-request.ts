import { createClient } from "@insforge/sdk";

/**
 * Lit le JWT InsForge depuis `Authorization: Bearer <token>`.
 * À utiliser dans les Route Handlers Next quand le front envoie le token
 * (recommandé pour toute logique sensible au-delà de l’anon key).
 */
export function getBearerAccessToken(request: Request): string | null {
  const raw = request.headers.get("authorization") ?? request.headers.get("Authorization");
  if (!raw) return null;
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() ?? null;
}

export function createInsforgeWithAccessToken(accessToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_INSFORGE_BASE_URL manquante");

  return createClient({
    baseUrl,
    anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    isServerMode: true,
    edgeFunctionToken: accessToken
  });
}
