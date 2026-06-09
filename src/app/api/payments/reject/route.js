export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "../../../../lib/db";
import Payment from "../../../../models/Payment";
import { requireAdmin } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const user = await requireAdmin(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "المستخدم غير مصرح",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const body = await request.json();

    const { paymentId, notes } = body;

    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم طلب الدفع غير صحيح",
        },
        {
          status: 400,
        }
      );
    }

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return NextResponse.json(
        {
          success: false,
          message: "طلب الدفع غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    if (payment.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "لا يمكن رفض هذا الطلب",
        },
        {
          status: 400,
        }
      );
    }

    payment.status = "rejected";
    payment.notes = String(notes || "").trim();

    await payment.save();

    return NextResponse.json({
      success: true,
      message: "تم رفض طلب الدفع بنجاح",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء رفض طلب الدفع",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}