import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";

const intl = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/panel")) return panelSession(request);
  return intl(request);
}

// Refresca la sesión de Supabase en cada request del panel y manda al login a
// quien no tenga sesión. Que la sesión sea de un admin lo verifica
// `requireAdmin()` en cada página; esto es solo la primera barrera.
async function panelSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (all) => {
          all.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          all.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isLogin = request.nextUrl.pathname === "/panel/login";

  if (!user && !isLogin) return NextResponse.redirect(new URL("/panel/login", request.url));
  if (user && isLogin) return NextResponse.redirect(new URL("/panel", request.url));
  return response;
}

export const config = { matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"] };
