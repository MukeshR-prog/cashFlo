import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth-constants";

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function getSessionCookieOptions(expiresAt?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
    expires: expiresAt,
  };
}

export function applySessionCookie(response: NextResponse, sessionToken: string, expiresAt: Date) {
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, getSessionCookieOptions(expiresAt));
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(new Date(0)),
    maxAge: 0,
  });
  return response;
}

export async function createSessionForUser(userId: string) {
  await connectDB();

  const sessionToken = generateSessionToken();
  const sessionTokenHash = hashSessionToken(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await User.findByIdAndUpdate(userId, {
    $set: {
      sessionTokenHash,
      sessionExpiresAt,
    },
  });

  return { sessionToken, sessionExpiresAt };
}

export async function clearSession(token?: string | null) {
  if (!token) {
    return;
  }

  await connectDB();
  await User.updateOne(
    { sessionTokenHash: hashSessionToken(token) },
    {
      $unset: {
        sessionTokenHash: "",
        sessionExpiresAt: "",
      },
    }
  );
}

export async function getSessionUser(token?: string | null) {
  if (!token) {
    return null;
  }

  await connectDB();

  const user = await User.findOne({
    sessionTokenHash: hashSessionToken(token),
    sessionExpiresAt: { $gt: new Date() },
  }).lean();

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    provider: user.provider,
  };
}