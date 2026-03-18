import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { applySessionCookie, createSessionForUser } from "@/app/api/_lib/auth/session";
import connectDB from "@/app/api/_lib/db/mongodb";
import User from "@/app/api/_lib/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();
    const normalizedName = name?.trim();
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedPassword = typeof password === "string" ? password : "";

    if (!normalizedName || !normalizedEmail || !normalizedPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (role !== "student" && role !== "freelancer") {
      return NextResponse.json({ error: "Please select a valid role" }, { status: 400 });
    }

    if (normalizedPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(normalizedPassword, 12);
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashed,
      provider: "credentials",
      role,
      onboardingCompleted: false,
      loginCount: 0,
      profile: {},
    });

    const { sessionToken, sessionExpiresAt } = await createSessionForUser(user.id);
    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          provider: "credentials",
          onboardingCompleted: false,
          isNewUser: true,
          loginCount: 0,
          role: user.role ?? null,
        },
      },
      { status: 201 }
    );

    return applySessionCookie(response, sessionToken, sessionExpiresAt);
  } catch (err) {
    console.error("[SIGNUP]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
