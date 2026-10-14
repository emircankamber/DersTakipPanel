import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./config";

const AUTH_ROUTES = ["/giris", "/kayit"];
const PUBLIC_PREFIXES = ["/auth"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Yapılandırma yoksa yalnızca giriş/kayıt sayfaları açılsın (orada uyarı gösterilir).
  if (!isSupabaseConfigured()) {
    const { pathname } = request.nextUrl;
    if (AUTH_ROUTES.includes(pathname)) return response;
    const url = request.nextUrl.clone();
    url.pathname = "/giris";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const supabase = createServerClient(
    supabaseUrl(),
    supabaseKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Not: createServerClient ile getUser arasına kod eklemeyin.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isPublic =
    isAuthRoute || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  const redirectTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user && !isPublic) return redirectTo("/giris");
  if (user && (isAuthRoute || pathname === "/")) return redirectTo("/panel");

  return response;
}
