import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/api/_lib/auth/constants";
import { getSessionUser } from "@/app/api/_lib/auth/session";

export interface SessionAuthResult {
  userId: string;
  user: Awaited<ReturnType<typeof getSessionUser>>;
}

export async function requireSession(): Promise<SessionAuthResult | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  const user = await getSessionUser(token);

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return {
    userId: user.id,
    user,
  };
}
