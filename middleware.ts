import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Copie les Set-Cookie issus du refresh session vers une redirection (évite de perdre la session). */
function redirectWithSessionCookies(
  url: URL,
  supabaseResponse: NextResponse
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      domain: cookie.domain,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      maxAge: cookie.maxAge,
      path: cookie.path,
      sameSite: cookie.sameSite as boolean | "lax" | "strict" | "none" | undefined,
      secure: cookie.secure,
      partitioned: cookie.partitioned,
      priority: cookie.priority,
    });
  });
  return redirectResponse;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicBooking = pathname.startsWith("/book");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  try {
    // Pattern recommandé @supabase/ssr ≥ 0.5 (getAll / setAll) — évite des erreurs Edge avec get/set/remove.
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options });
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set({ name, value, ...options });
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isPublicBooking) return supabaseResponse;

    if ((isDashboardRoute || isAdminRoute) && !user) {
      return redirectWithSessionCookies(new URL("/login", request.url), supabaseResponse);
    }

    if (isAuthRoute && user) {
      return redirectWithSessionCookies(new URL("/dashboard", request.url), supabaseResponse);
    }

    if (isAdminRoute && user) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role !== "super_admin") {
          return redirectWithSessionCookies(new URL("/dashboard", request.url), supabaseResponse);
        }
      } catch {
        return redirectWithSessionCookies(new URL("/dashboard", request.url), supabaseResponse);
      }
    }

    return supabaseResponse;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
