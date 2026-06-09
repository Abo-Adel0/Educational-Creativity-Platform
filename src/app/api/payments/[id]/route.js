export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "../../../../lib/db";
import Payment from "../../../../models/Payment";
import { requireAuth } from "../../../../lib/auth";

export async function GET(request, { params }) {
  try {
    const user = await requireAuth(request);

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

    const paymentId = params?.id;

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

    await connectDB();

    const payment = await Payment.findById(paymentId)
      .populate("course")
      .populate("user", "studentPhone role");

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

    const currentUserId = user.id || user._id;
    const paymentUserId = payment.user?._id?.toString();

    if (
      user.role !== "admin" &&
      user.role !== "owner" &&
      paymentUserId !== currentUserId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بمشاهدة هذا الطلب",
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json({
      success: true,
      payment,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب طلب الدفع",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}