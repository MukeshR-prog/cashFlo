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

    // Check existence before upsert so we can detect first-ever login
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    const isNewUser = !existingUser;

    const user = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $setOnInsert: {
          email: normalizedEmail,
          onboardingCompleted: false,
          role: null,
        },
        $set: {
          name: normalizedName,
          image: image ?? null,
          provider: "google",
          providerId: uid,
        },
        // Increment loginCount only for returning users
        ...(existingUser ? { $inc: { loginCount: 1 } } : {}),
      },
      { upsert: true, returnDocument: "after" }
    );

    const onboardingCompleted: boolean = (user as any).onboardingCompleted ?? false;
    const loginCount: number = (user as any).loginCount ?? 0;

    const { sessionToken, sessionExpiresAt } = await createSessionForUser(user.id);
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        provider: "google",
        onboardingCompleted,
        isNewUser,
        loginCount,
        role: (user as any).role ?? null,
      },
    });

    return applySessionCookie(response, sessionToken, sessionExpiresAt);
  } catch (err) {
    console.error("[GOOGLE_SYNC]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

