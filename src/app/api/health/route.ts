import { NextResponse } from "next/server";

/**
 * Santé de l’app Next + connectivité InsForge (GET /api/health côté backend InsForge).
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_BASE_URL?.replace(/\/$/, "") ?? "";
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY);

  const payload: Record<string, unknown> = {
    ok: true,
    app: "ivoire-suite-flow",
    insforge: {
      configured: Boolean(baseUrl && hasAnon),
      baseUrlPresent: Boolean(baseUrl),
      anonKeyPresent: hasAnon
    }
  };

  if (!baseUrl) {
    return NextResponse.json({ ...payload, ok: false, message: "NEXT_PUBLIC_INSFORGE_BASE_URL manquante" }, { status: 503 });
  }

  try {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    const text = await res.text();
    let body: unknown = null;
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { raw: text.slice(0, 200) };
    }
    return NextResponse.json({
      ...payload,
      insforge: {
        ...(payload.insforge as object),
        reachable: res.ok,
        status: res.status,
        body
      }
    });
  } catch (e) {
    return NextResponse.json(
      {
        ...payload,
        ok: false,
        insforge: {
          ...(payload.insforge as object),
          reachable: false,
          error: e instanceof Error ? e.message : "Erreur réseau"
        }
      },
      { status: 503 }
    );
  }
}
