import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import connectDB from "@/app/api/_lib/db/mongodb";
import Client from "@/app/api/_lib/models/Client";
import { requireSession } from "@/app/api/_lib/auth/require-session";

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  paymentDueDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid client id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateClientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
    }

    await connectDB();

    const updatePayload: Record<string, unknown> = { ...parsed.data };
    if ("paymentDueDate" in parsed.data) {
      updatePayload.paymentDueDate = parsed.data.paymentDueDate ? new Date(parsed.data.paymentDueDate) : null;
    }

    const updated = await Client.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { $set: updatePayload },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({
      client: {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email ?? null,
        phone: updated.phone ?? null,
        paymentDueDate: updated.paymentDueDate ? updated.paymentDueDate.toISOString().split("T")[0] : null,
        notes: updated.notes ?? null,
      },
    });
  } catch (error) {
    console.error("[CLIENTS_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await context.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid client id" }, { status: 400 });
    }

    await connectDB();

    const deleted = await Client.findOneAndDelete({ _id: id, userId: auth.userId }).lean();
    if (!deleted) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Client deleted" });
  } catch (error) {
    console.error("[CLIENTS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
