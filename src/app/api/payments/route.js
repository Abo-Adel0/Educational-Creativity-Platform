export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "../../../lib/db";
import Payment from "../../../models/Payment";
import Course from "../../../models/Course";
import { requireAuth } from "../../../lib/auth";

const allowedMethods = ["vodafone_cash", "instapay"];

export async function GET(request) {
  try {
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

    await connectDB();

    const url = new URL(request.url);
    const status = url.searchParams.get("status");

    const query = {};

    if (user.role !== "admin" && user.role !== "owner") {
      query.user = user.id || user._id;
    }

    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate("course")
      .populate("user", "studentPhone parentPhone role")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب المدفوعات",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuth(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "سجل الدخول أولًا لإرسال طلب الدفع",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      courseId,
      amount,
      method = "vodafone_cash",
      senderPhone,
      referenceCode,
      providerTransactionId,
      proofImage,
      proofImageBase64,
      notes,
    } = body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الكورس غير صحيح",
        },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "الكورس غير موجود",
        },
        { status: 404 }
      );
    }

    if (amount === undefined || amount === null || amount === "") {
      return NextResponse.json(
        {
          success: false,
          message: "المبلغ مطلوب",
        },
        { status: 400 }
      );
    }

    if (!allowedMethods.includes(method)) {
      return NextResponse.json(
        {
          success: false,
          message: "اختر Vodafone Cash أو InstaPay",
        },
        { status: 400 }
      );
    }

    if (!senderPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف المحول منه مطلوب",
        },
        { status: 400 }
      );
    }

    const normalizedAmount = Number(amount);

    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "المبلغ غير صالح",
        },
        { status: 400 }
      );
    }

    let finalProofImage = String(proofImage || "").trim();

    if (proofImageBase64) {
      const cloudinaryModule = await import("../../../lib/cloudinary");
      const cloudinary = cloudinaryModule.default;
      const { ensureCloudinaryConfig } = cloudinaryModule;

      ensureCloudinaryConfig();

      const uploadResult = await cloudinary.uploader.upload(proofImageBase64, {
        folder: "almobde3-platform/payments",
      });

      finalProofImage = uploadResult.secure_url;
    }

    const payment = await Payment.create({
      user: user.id || user._id,
      course: courseId,
      amount: normalizedAmount,
      method,
      senderPhone: String(senderPhone || "").trim(),
      referenceCode: String(referenceCode || "").trim(),
      providerTransactionId: String(providerTransactionId || "").trim(),
      proofImage: finalProofImage,
      notes: String(notes || "").trim(),
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إرسال طلب الدفع بنجاح، وسيتم فتح الكورس بعد مراجعة الإدارة",
        payment,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إنشاء طلب الدفع",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
