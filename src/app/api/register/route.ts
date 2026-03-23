import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

type Body = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  organization_name: string;
  organization_city: string;
  establishment_name: string;
  establishment_type: string;
  establishment_address: string;
  establishment_neighborhood: string;
  establishment_city: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");
    if (!email || !password || password.length < 6) {
      return NextResponse.json({ success: false, message: "Email ou mot de passe invalide (min. 6 caractères)." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: body.full_name }
    });

    if (createError || !created.user) {
      return NextResponse.json(
        { success: false, message: createError?.message ?? "Création du compte impossible." },
        { status: 400 }
      );
    }

    const userId = created.user.id;
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: body.organization_name,
        city: body.organization_city,
        email,
        phone: body.phone,
        subscription_plan: "trial",
        subscription_status: "trial",
        trial_ends_at: trialEndsAt
      })
      .select("id")
      .single();

    if (orgError || !organization) {
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, message: orgError?.message ?? "Organisation non créée." }, { status: 400 });
    }

    const slug = `${String(body.establishment_name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-5)}`;

    const { data: establishment, error: estError } = await supabase
      .from("establishments")
      .insert({
        organization_id: organization.id,
        name: body.establishment_name,
        slug,
        type: body.establishment_type as
          | "hotel"
          | "residence_meublee"
          | "auberge"
          | "motel"
          | "maison_hotes"
          | "appart_hotel",
        address: body.establishment_address,
        neighborhood: body.establishment_neighborhood,
        city: body.establishment_city,
        country: "CI"
      })
      .select("id")
      .single();

    if (estError || !establishment) {
      await supabase.from("organizations").delete().eq("id", organization.id);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, message: estError?.message ?? "Établissement non créé." }, { status: 400 });
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      organization_id: organization.id,
      establishment_id: establishment.id,
      full_name: body.full_name,
      email,
      phone: body.phone,
      role: "admin"
    });

    if (profileError) {
      await supabase.from("organizations").delete().eq("id", organization.id);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ success: false, message: profileError.message ?? "Profil non créé." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: e instanceof Error ? e.message : "Erreur serveur inscription." },
      { status: 500 }
    );
  }
}
