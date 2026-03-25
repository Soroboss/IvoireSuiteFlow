import { jsonError, jsonOk } from "@/lib/api/response";
import { createInsforgeWithAccessToken, getBearerAccessToken } from "@/lib/insforge/from-request";

/**
 * Liste des organisations (Super Admin uniquement).
 * En-tête : `Authorization: Bearer <access_token>`
 */
export async function GET(request: Request) {
  try {
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
    const { data: profileRows, error: profileError } = await insforge.database.from("profiles").select("role").eq("id", userId);
    if (profileError) {
      return jsonError(profileError.message, 500, "PROFILE_QUERY_FAILED");
    }
    const profile = Array.isArray(profileRows) ? profileRows[0] : null;
    if (profile?.role !== "super_admin") {
      return jsonError("Accès réservé au Super Admin.", 403, "FORBIDDEN");
    }

    const { data: orgs, error: orgError } = await insforge.database
      .from("organizations")
      .select("id, name, city, subscription_plan, subscription_status, trial_ends_at, subscription_ends_at, max_establishments, created_at")
      .order("created_at", { ascending: false });

    if (orgError) {
      return jsonError(orgError.message, 500, "ORG_QUERY_FAILED");
    }

    const { data: rooms } = await insforge.database.from("rooms").select("organization_id");
    const roomCountByOrg = new Map<string, number>();
    (rooms ?? []).forEach((r) => {
      const id = r.organization_id as string;
      roomCountByOrg.set(id, (roomCountByOrg.get(id) ?? 0) + 1);
    });

    const rows = (orgs ?? []).map((o) => ({
      ...o,
      room_count: roomCountByOrg.get(o.id) ?? 0
    }));

    return jsonOk({ rows });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Erreur serveur", 500, "INTERNAL");
  }
}
