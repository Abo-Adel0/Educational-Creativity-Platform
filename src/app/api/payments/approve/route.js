export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "../../../../lib/db";
import Payment from "../../../../models/Payment";
import Enrollment from "../../../../models/Enrollment";
import User from "../../../../models/User";
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

    const {
      paymentId,
      expiresAt,
      notes,
    } = body;

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
          message: "لا يمكن الموافقة على هذا الطلب",
        },
        {
          status: 400,
        }
      );
    }

    payment.status = "paid";
    payment.notes = String(notes || "").trim();

    await payment.save();

    const existingEnrollment = await Enrollment.findOne({
      user: payment.user,
      course: payment.course,
    });

    if (existingEnrollment) {
      existingEnrollment.status = "active";
      existingEnrollment.payment = payment._id;
      existingEnrollment.startedAt = new Date();
      existingEnrollment.expiresAt = expiresAt
        ? new Date(expiresAt)
        : null;

      await existingEnrollment.save();
    } else {
      await Enrollment.create({
        user: payment.user,
        course: payment.course,
        status: "active",
        payment: payment._id,
        startedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });
    }

    await User.findByIdAndUpdate(payment.user, {
      $addToSet: {
        paidCourses: payment.course.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تمت الموافقة على الدفع وتم فتح الكورس للطالب",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء الموافقة على الدفع",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}