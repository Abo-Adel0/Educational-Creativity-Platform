export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import {
  hashPassword,
  isOwnerPhone,
  signToken,
  createAuthCookie,
} from "../../../../lib/auth";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { studentPhone, parentPhone, password, confirmPassword } = body;

    if (!studentPhone || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "يرجى إدخال جميع البيانات",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "كلمتا السر غير متطابقتين",
        },
        { status: 400 }
      );
    }

    const normalizedPhone = String(studentPhone).trim();
    const existingUser = await User.findOne({
      studentPhone: normalizedPhone,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "هذا الحساب موجود بالفعل",
        },
        { status: 409 }
      );
    }

    const role = isOwnerPhone(normalizedPhone)
      ? "owner"
      : "student";

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      studentPhone: normalizedPhone,
      parentPhone: String(parentPhone || "").trim(),
      password: hashedPassword,
      role,
      blocked: false,
      paidCourses: role === "owner" ? ["all"] : [],
    });

    const userData = {
      id: newUser._id.toString(),
      studentPhone: newUser.studentPhone,
      parentPhone: newUser.parentPhone,
      role: newUser.role,
      blocked: newUser.blocked,
      paidCourses: newUser.paidCourses,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    const token = signToken(newUser);
    const response = NextResponse.json(
      {
        success: true,
        message: role === "owner"
          ? "مرحبًا بك يا مالك المنصة 👑"
          : "تم إنشاء الحساب بنجاح",
        user: userData,
      },
      { status: 201 }
    );

    response.cookies.set(createAuthCookie(token));
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إنشاء الحساب",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
