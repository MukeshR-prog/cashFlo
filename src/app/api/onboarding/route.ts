import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/app/api/_lib/auth/session";
import connectDB from "@/app/api/_lib/db/mongodb";
import User from "@/app/api/_lib/models/User";
import { SESSION_COOKIE_NAME } from "@/app/api/_lib/auth/constants";

const studentProfileSchema = z.object({
  school: z.string().min(1),
  course: z.string().min(1),
  monthlyBudget: z.union([z.number().nonnegative(), z.null()]).optional(),
  graduationYear: z.union([z.number().int().min(2000).max(2100), z.null()]).optional(),
});

const freelancerProfileSchema = z.object({
  primaryService: z.string().min(1),
  experienceLevel: z.enum(["beginner", "intermediate", "expert"]).optional(),
  monthlyIncomeGoal: z.union([z.number().nonnegative(), z.null()]).optional(),
  skills: z.array(z.string().min(1)).optional().default([]),
  portfolioUrl: z.union([
    z.string().url(),
    z.string().max(0),
    z.literal(""),
    z.null(),
  ]).optional().transform((v) => (!v ? null : v)),
});

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
    const sessionUser = await getSessionUser(sessionToken);

    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, profile } = body;

    if (!role || (role !== "student" && role !== "freelancer")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (role === "student") {
      const parsed = studentProfileSchema.safeParse(profile ?? {});
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid student profile" }, { status: 400 });
      }
    }

    if (role === "freelancer") {
      const parsed = freelancerProfileSchema.safeParse(profile ?? {});
      if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid freelancer profile" }, { status: 400 });
      }
    }

    await connectDB();

    const updated = await User.findByIdAndUpdate(
      sessionUser.id,
      {
        $set: {
          role,
          profile: profile ?? {},
          onboardingCompleted: true,
        },
      },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
        image: updated.image ?? null,
        provider: updated.provider,
        role: (updated as any).role ?? null,
        onboardingCompleted: (updated as any).onboardingCompleted ?? false,
        profile: (updated as any).profile ?? null,
      },
    });
  } catch (err) {
    console.error("[ONBOARDING_POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
