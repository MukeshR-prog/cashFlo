import { NextRequest, NextResponse } from "next/server";
import {
  clearSession,
  clearSessionCookie,
  getSessionUser,
} from "@/app/api/_lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/app/api/_lib/auth/constants";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
    const user = await getSessionUser(sessionToken);

    if (!user) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return clearSessionCookie(response);
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[SESSION_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;

    await clearSession(sessionToken);

    const response = NextResponse.json({ message: "Logged out" });
    return clearSessionCookie(response);
  } catch (error) {
    console.error("[SESSION_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}