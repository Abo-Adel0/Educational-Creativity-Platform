export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import Course from "../../../models/Course";
import { requireAuth } from "../../../lib/auth";

/* =========================
   GET COURSES
========================= */

export async function GET() {
  try {
    await connectDB();

    const courses = await Course.find({
      isPublished: true,
    })
      .populate("teacher")
      .sort({
        createdAt: -1,
      });

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب الكورسات",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   CREATE COURSE
========================= */

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

    const {
      title,
      description,
      grade,
      price,
      image,
      imageBase64,
      teacherId,
      isFeatured,
    } = body;

    if (!title || !grade) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم الكورس والصف الدراسي مطلوبين",
        },
        {
          status: 400,
        }
      );
    }

    let finalImage = image || "";

    /*
      لو الصورة جاية Base64 من الفورم،
      هنرفعها Cloudinary.
      لو جاية كرابط عادي، هنحفظ الرابط مباشرة.
    */

    if (imageBase64) {
      const cloudinaryModule = await import(
        "../../../lib/cloudinary"
      );

      const cloudinary = cloudinaryModule.default;

      const uploadResult =
        await cloudinary.uploader.upload(
          imageBase64,
          {
            folder:
              "almobde3-platform/courses",
          }
        );

      finalImage = uploadResult.secure_url;
    }

    const course = await Course.create({
      title,
      description: description || "",
      grade,
      price: Number(price) || 0,
      image: finalImage,
      teacher: teacherId || null,
      isFeatured: Boolean(isFeatured),
      lessonsCount: 0,
      videosCount: 0,
      filesCount: 0,
      examsCount: 0,
      isPublished: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إضافة الكورس بنجاح",
        course,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إضافة الكورس",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}