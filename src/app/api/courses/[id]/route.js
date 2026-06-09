export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import Course from "../../../../models/Course";
import { requireAuth } from "../../../../lib/auth";

/* =========================
   GET SINGLE COURSE
========================= */

export async function GET(request, { params }) {
  try {
    await connectDB();

    const course = await Course.findById(
      params.id
    ).populate("teacher");

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "الكورس غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب الكورس",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   UPDATE COURSE
========================= */

export async function PATCH(request, { params }) {
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
      isPublished,
    } = body;

    const course = await Course.findById(
      params.id
    );

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "الكورس غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    let finalImage = image ?? course.image;

    if (imageBase64) {
      const cloudinaryModule = await import(
        "../../../../lib/cloudinary"
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

    course.title = title ?? course.title;
    course.description =
      description ?? course.description;
    course.grade = grade ?? course.grade;
    course.price =
      price !== undefined
        ? Number(price) || 0
        : course.price;
    course.image = finalImage;

    course.teacher =
      teacherId !== undefined
        ? teacherId || null
        : course.teacher;

    if (isFeatured !== undefined) {
      course.isFeatured = Boolean(isFeatured);
    }

    if (isPublished !== undefined) {
      course.isPublished = Boolean(isPublished);
    }

    await course.save();

    return NextResponse.json({
      success: true,
      message: "تم تعديل الكورس بنجاح",
      course,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تعديل الكورس",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   DELETE COURSE
========================= */

export async function DELETE(request, { params }) {
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

    const course = await Course.findById(
      params.id
    );

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          message: "الكورس غير موجود",
        },
        {
          status: 404,
        }
      );
    }

    /*
      حذف ناعم:
      مش بنمسح الكورس نهائيًا من الداتابيز،
      بنخليه غير منشور عشان نقدر نرجعه بعدين لو احتجنا.
    */

    course.isPublished = false;

    await course.save();

    return NextResponse.json({
      success: true,
      message: "تم حذف الكورس بنجاح",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حذف الكورس",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}