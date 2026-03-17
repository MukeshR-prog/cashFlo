import { NextRequest, NextResponse } from "next/server";
import { applySessionCookie, createSessionForUser } from "@/app/api/_lib/auth/session";
import connectDB from "@/app/api/_lib/db/mongodb";
import User from "@/app/api/_lib/models/User";

// Called by client after successful Firebase Google Sign-In
// to upsert user record in MongoDB
export async function POST(req: NextRequest) {
  try {
    const { uid, name, email, image } = await req.json();
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedName = name?.trim() || normalizedEmail?.split("@")[0] || "Google User";

    if (!uid || !normalizedEmail) {
      return NextResponse.json({ error: "uid and email are required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $setOnInsert: { email: normalizedEmail },
        $set: {
          name: normalizedName,
          image: image ?? null,
          provider: "google",
          providerId: uid,
        },
      },
      { upsert: true, new: true }
    );

    const { sessionToken, sessionExpiresAt } = await createSessionForUser(user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        provider: "google",
      },
    });

    return applySessionCookie(response, sessionToken, sessionExpiresAt);
  } catch (err) {
    console.error("[GOOGLE_SYNC]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
