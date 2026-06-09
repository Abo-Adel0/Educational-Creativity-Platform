export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { requireAuth } from "../../../../lib/auth";

export async function GET(request) {
  const user = await requireAuth(request);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        message: "المستخدم غير مصرح",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    user,
  });
}
