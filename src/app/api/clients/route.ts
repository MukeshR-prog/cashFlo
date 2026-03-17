import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/app/api/_lib/db/mongodb";
import Client from "@/app/api/_lib/models/Client";
import { requireSession } from "@/app/api/_lib/auth/require-session";

const createClientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export async function GET() {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();
    const clients = await Client.find({ userId: auth.userId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      clients: clients.map((client) => ({
        id: client._id.toString(),
        name: client.name,
        email: client.email ?? null,
        phone: client.phone ?? null,
      })),
    });
  } catch (error) {
    console.error("[CLIENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const created = await Client.create({
      userId: auth.userId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
    });

    return NextResponse.json(
      {
        client: {
          id: created._id.toString(),
          name: created.name,
          email: created.email ?? null,
          phone: created.phone ?? null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CLIENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
