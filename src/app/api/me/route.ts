import { jsonError, jsonOk } from "@/lib/api/response";
import { createInsforgeWithAccessToken, getBearerAccessToken } from "@/lib/insforge/from-request";

/**
 * GET /api/me
 * En-tête requis : `Authorization: Bearer <access_token>`
 * Retourne l’utilisateur InsForge courant (vérifie le JWT).
 */
export async function GET(request: Request) {
  const token = getBearerAccessToken(request);
  if (!token) {
    return jsonError("Authentification requise (Bearer token).", 401, "UNAUTHORIZED");
  }

  const insforge = createInsforgeWithAccessToken(token);
  const { data, error } = await insforge.auth.getCurrentUser();

  if (error || !data?.user) {
    return jsonError(error?.message ?? "Session invalide.", 401, "INVALID_SESSION");
  }

  return jsonOk({ ok: true as const, user: data.user });
}
