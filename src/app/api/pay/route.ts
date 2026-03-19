import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isAllowedScheme(url: string): boolean {
  return /^(https?:|upi:|mailto:)/i.test(url);
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("to")?.trim();

  if (!target) {
    return NextResponse.json({ error: "Missing payment target" }, { status: 400 });
  }

  const decoded = decodeURIComponent(target);
  if (!isAllowedScheme(decoded)) {
    return NextResponse.json({ error: "Unsupported payment link" }, { status: 400 });
  }

  return NextResponse.redirect(decoded, { status: 302 });
}
