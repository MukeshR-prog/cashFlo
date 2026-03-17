import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/api/_lib/db/mongodb";
import { requireSession } from "@/app/api/_lib/auth/require-session";
import Notification from "@/app/api/_lib/models/Notification";
import mongoose from "mongoose";

// GET /api/notifications — fetch latest 25 notifications for the user
export async function GET(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    const unreadCount = await Notification.countDocuments({ userId, read: false });

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n._id.toString(),
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt,
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/notifications — mark all as read
export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/notifications — create a notification (internal utility)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireSession();
    if (auth instanceof NextResponse) return auth;

    const { message, type } = await req.json();
    if (!message || !type) {
      return NextResponse.json({ error: "message and type are required" }, { status: 400 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(auth.userId);
    const notif = await Notification.create({ userId, message, type, read: false });

    return NextResponse.json({
      notification: {
        id: notif._id.toString(),
        message: notif.message,
        type: notif.type,
        read: notif.read,
        createdAt: notif.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[NOTIFICATIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
