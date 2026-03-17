import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Notification from "@/app/api/_lib/models/Notification";
import mongoose from "mongoose";

// PATCH /api/notifications/[id] — mark single notification as read
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const notif = await Notification.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId },
      { $set: { read: true } },
      { new: true }
    ).lean();

    if (!notif) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATION_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/notifications/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    await Notification.deleteOne({ _id: new mongoose.Types.ObjectId(id), userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATION_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
