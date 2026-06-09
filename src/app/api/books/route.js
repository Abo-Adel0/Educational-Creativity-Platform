export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import Book from "../../../models/Book";
import { requireAuth } from "../../../lib/auth";

/* =========================
   GET BOOKS
========================= */

export async function GET() {
  try {
    await connectDB();

    const books = await Book.find({
      isPublished: true,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      books,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب الكتب",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   CREATE BOOK
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
      pdf,
      pdfBase64,
      isFeatured,
    } = body;

    if (!title || price === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "اسم الكتاب والسعر مطلوبين",
        },
        {
          status: 400,
        }
      );
    }

    let finalImage = image || "";
    let finalPdf = pdf || "";

    if (imageBase64) {
      const cloudinaryModule = await import(
        "../../../lib/cloudinary"
      );

      const cloudinary = cloudinaryModule.default;

      const uploadResult =
        await cloudinary.uploader.upload(
          imageBase64,
          {
            folder: "almobde3-platform/books/images",
          }
        );

      finalImage = uploadResult.secure_url;
    }

    if (pdfBase64) {
      const cloudinaryModule = await import(
        "../../../lib/cloudinary"
      );

      const cloudinary = cloudinaryModule.default;

      const uploadResult =
        await cloudinary.uploader.upload(
          pdfBase64,
          {
            folder: "almobde3-platform/books/pdfs",
            resource_type: "raw",
          }
        );

      finalPdf = uploadResult.secure_url;
    }

    const book = await Book.create({
      title,
      description: description || "",
      grade: grade || "",
      price: Number(price) || 0,
      image: finalImage,
      pdf: finalPdf,
      isFeatured: Boolean(isFeatured),
      isPublished: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "تم إضافة الكتاب بنجاح",
        book,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إضافة الكتاب",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   DELETE BOOK
========================= */

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
          message: "رقم الكتاب غير موجود",
        },
        {
          status: 400,
        }
      );
    }

    await Book.findByIdAndUpdate(id, {
      isPublished: false,
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف الكتاب بنجاح",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حذف الكتاب",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}