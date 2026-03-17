import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  applySessionCookie,
  clearSession,
  clearSessionCookie,
  createSessionForUser,
} from "@/app/api/_lib/auth/session";
import { SESSION_COOKIE_NAME } from "@/app/api/_lib/auth/constants";
import connectDB from "@/app/api/_lib/db/mongodb";
import User from "@/app/api/_lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    user.loginCount = ((user as any).loginCount ?? 0) + 1;
    await user.save();

    const onboardingCompleted = (user as any).onboardingCompleted ?? false;
    const loginCount: number = (user as any).loginCount ?? 1;

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        provider: "credentials",
        onboardingCompleted,
        isNewUser: false,
        loginCount,
        role: (user as any).role ?? null,
      },
    });

    const { sessionToken, sessionExpiresAt } = await createSessionForUser(user.id);
    return applySessionCookie(response, sessionToken, sessionExpiresAt);
  } catch (err) {
    console.error("[LOGIN]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  await clearSession(sessionToken);

  const response = NextResponse.json({ message: "Logged out" });
  return clearSessionCookie(response);
}

