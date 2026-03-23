import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Données Super Admin SaaS (toutes les organisations).
 * Vérifie le rôle `super_admin` via la session, puis lit via service role (bypass RLS).
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

    if (profileError || profile?.role !== "super_admin") {
      return NextResponse.json({ error: "Accès réservé au Super Admin IvoireSuiteFlow" }, { status: 403 });
    }

    const admin = getSupabaseAdmin();
    const { data: orgs, error: orgError } = await admin
      .from("organizations")
      .select("id, name, city, subscription_plan, subscription_status, trial_ends_at, subscription_ends_at, max_establishments, created_at")
      .order("created_at", { ascending: false });

    if (orgError) {
      return NextResponse.json({ error: orgError.message }, { status: 500 });
    }

    const { data: rooms } = await admin.from("rooms").select("organization_id");
    const roomCountByOrg = new Map<string, number>();
    (rooms ?? []).forEach((r) => {
      const id = r.organization_id as string;
      roomCountByOrg.set(id, (roomCountByOrg.get(id) ?? 0) + 1);
    });

    const rows = (orgs ?? []).map((o) => ({
      ...o,
      room_count: roomCountByOrg.get(o.id) ?? 0
    }));

    return NextResponse.json({ rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
