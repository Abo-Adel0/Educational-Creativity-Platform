export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import {
  isOwnerPhone,
  signToken,
  createAuthCookie,
  comparePassword,
  hashPassword,
} from "../../../../lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى إدخال رقم الهاتف وكلمة السر",
        },
        { status: 400 }
      );
    }

    const normalizedPhone = String(phone).trim();
    let user = await User.findOne({
      studentPhone: normalizedPhone,
    });

    if (user && isOwnerPhone(normalizedPhone) && user.role !== "owner") {
      user.role = "owner";
      user.paidCourses = ["all"];
      await user.save();
    }

    if (!user && isOwnerPhone(normalizedPhone)) {
      const hashedPassword = await hashPassword(password);

      user = await User.create({
        studentPhone: normalizedPhone,
        parentPhone: "",
        password: hashedPassword,
        role: "owner",
        blocked: false,
        paidCourses: ["all"],
      });
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف أو كلمة السر غير صحيحة",
        },
        { status: 401 }
      );
    }

    const passwordMatches = await comparePassword(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف أو كلمة السر غير صحيحة",
        },
        { status: 401 }
      );
    }

    if (user.blocked) {
      return NextResponse.json(
        {
          success: false,
          message: "تم حظر هذا الحساب، يرجى التواصل مع الدعم الفني",
        },
        { status: 403 }
      );
    }

    const token = signToken(user);
    const userData = {
      id: user._id.toString(),
      studentPhone: user.studentPhone,
      parentPhone: user.parentPhone || "",
      role: user.role,
      blocked: user.blocked,
      paidCourses: user.paidCourses || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const response = NextResponse.json({
      success: true,
      message:
        user.role === "owner"
          ? "مرحبًا بك يا مالك المنصة 👑"
          : user.role === "admin"
          ? "مرحبًا بك يا أدمن المنصة"
          : "تم تسجيل الدخول بنجاح",
      user: userData,
    });

    response.cookies.set(createAuthCookie(token));
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تسجيل الدخول",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
