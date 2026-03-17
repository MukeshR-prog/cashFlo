import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/api/_lib/auth/constants";

const AUTH_ROUTES = ["/login", "/signup"];

export function proxy(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && token) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup"],
};
