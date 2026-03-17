import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import User from "@/app/api/_lib/models/User";

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  image: z.string().url().optional(),
});

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const user = await User.findById(auth.userId).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image ?? null,
        provider: user.provider,
        role: (user as any).role ?? null,
        onboardingCompleted: (user as any).onboardingCompleted ?? false,
      },
    });
  } catch (error) {
    console.error("[SETTINGS_PROFILE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();
    const updated = await User.findByIdAndUpdate(auth.userId, { $set: parsed.data }, { new: true }).lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
        image: updated.image ?? null,
        provider: updated.provider,
      },
    });
  } catch (error) {
    console.error("[SETTINGS_PROFILE_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
