import { jsonError, jsonOk } from "@/lib/api/response";
import { createInsforgeWithAccessToken, getBearerAccessToken } from "@/lib/insforge/from-request";

/**
 * GET /api/context
 * En-tête : `Authorization: Bearer <access_token>`
 * Retourne l’utilisateur + ligne `profiles` (organisation / établissement / rôle).
 */
export async function GET(request: Request) {
  const token = getBearerAccessToken(request);
  if (!token) {
    return jsonError("Authentification requise (Bearer token).", 401, "UNAUTHORIZED");
  }

  const insforge = createInsforgeWithAccessToken(token);
  const { data: authData, error: authError } = await insforge.auth.getCurrentUser();

  if (authError || !authData?.user) {
    return jsonError(authError?.message ?? "Session invalide.", 401, "INVALID_SESSION");
  }

  const userId = authData.user.id;
  const { data: profileRows, error: profileError } = await insforge.database.from("profiles").select("*").eq("id", userId);

  if (profileError) {
    return jsonError(profileError.message, 500, "PROFILE_QUERY_FAILED");
  }

  const profile = Array.isArray(profileRows) ? profileRows[0] ?? null : null;

  return jsonOk({
    ok: true as const,
    user: authData.user,
    profile
  });
}
