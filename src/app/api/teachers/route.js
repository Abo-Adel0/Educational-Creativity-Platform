export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import Teacher from "../../../models/Teacher";
import { requireAuth } from "../../../lib/auth";

export async function GET() {
  try {
    await connectDB();

    const teachers = await Teacher.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, teachers });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب المدرسين",
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
          message: "المستخدم غير مصرح",
        },
        { status: 401 }
      );
    }

    if (user.role !== "admin" && user.role !== "owner") {
      return NextResponse.json(
        {
          success: false,
          message: "غير مسموح لك بتنفيذ هذا الإجراء",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { name, subject, description, image, imageBase64 } = body;

    if (!name || !subject) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم المدرس والمادة مطلوبين",
        },
        { status: 400 }
      );
    }

    let finalImage = image || "";

    if (imageBase64) {
      const cloudinaryModule = await import("../../../lib/cloudinary");
      const cloudinary = cloudinaryModule.default;

      const uploadResult = await cloudinary.uploader.upload(imageBase64, {
        folder: "almobde3-platform/teachers",
      });

      finalImage = uploadResult.secure_url;
    }

    const teacher = await Teacher.create({
      name,
      subject,
      description: description || "",
      image: finalImage,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إضافة المدرس بنجاح",
        teacher,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إضافة المدرس",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
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

    if (user.role !== "admin" && user.role !== "owner") {
      return NextResponse.json(
        {
          success: false,
          message: "غير مسموح لك بتنفيذ هذا الإجراء",
        },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم المدرس مطلوب",
        },
        { status: 400 }
      );
    }

    const teacher = await Teacher.findById(id);

    if (!teacher) {
      return NextResponse.json(
        {
          success: false,
          message: "المدرس غير موجود",
        },
        { status: 404 }
      );
    }

    teacher.isActive = false;
    await teacher.save();

    return NextResponse.json({
      success: true,
      message: "تم حذف المدرس بنجاح",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حذف المدرس",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
