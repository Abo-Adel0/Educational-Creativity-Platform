export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import { hashPassword, isOwnerPhone, requireAdmin, requireOwner } from "../../../lib/auth";

function normalizePhone(phone) {
  let value = String(phone || "").trim().replace(/[^\d]/g, "");

  if (value.startsWith("0020")) {
    value = "0" + value.slice(4);
  }

  if (value.startsWith("20") && value.length === 12) {
    value = "0" + value.slice(2);
  }

  return value;
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    studentPhone: user.studentPhone,
    parentPhone: user.parentPhone || "",
    role: user.role,
    blocked: Boolean(user.blocked),
    paidCourses: user.paidCourses || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function GET(request) {
  try {
    const admin = await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح لك بعرض المستخدمين",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const users = await User.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map(publicUser),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب المستخدمين",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const action = body.action;

    const admin = action === "addAdmin" || action === "removeAdmin"
      ? await requireOwner(request)
      : await requireAdmin(request);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "غير مصرح بتنفيذ العملية",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const phone = normalizePhone(body.phone);

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الهاتف مطلوب",
        },
        { status: 400 }
      );
    }

    if (action === "addAdmin") {
      if (isOwnerPhone(phone)) {
        return NextResponse.json({
          success: false,
          message: "هذا الرقم مالك بالفعل",
        }, { status: 400 });
      }

      const existing = await User.findOne({ studentPhone: phone });

      if (existing) {
        existing.role = "admin";
        existing.blocked = false;
        existing.paidCourses = ["all"];
        await existing.save();
      } else {
        const password = await hashPassword("123456");
        await User.create({
          studentPhone: phone,
          parentPhone: "",
          password,
          role: "admin",
          blocked: false,
          paidCourses: ["all"],
        });
      }

      return NextResponse.json({
        success: true,
        message: "تم إضافة الأدمن بنجاح وكلمة السر المؤقتة 123456",
      });
    }

    if (action === "removeAdmin") {
      if (isOwnerPhone(phone)) {
        return NextResponse.json({
          success: false,
          message: "لا يمكن إزالة المالك",
        }, { status: 400 });
      }

      const user = await User.findOne({ studentPhone: phone });

      if (!user) {
        return NextResponse.json({
          success: false,
          message: "الأدمن غير موجود",
        }, { status: 404 });
      }

      user.role = "student";
      user.paidCourses = Array.isArray(user.paidCourses)
        ? user.paidCourses.filter((course) => course !== "all")
        : [];
      await user.save();

      return NextResponse.json({
        success: true,
        message: "تم إزالة الأدمن",
      });
    }

    const user = await User.findOne({ studentPhone: phone });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "الحساب غير موجود",
      }, { status: 404 });
    }

    if ((user.role === "owner" || user.role === "admin") && action !== "changePassword") {
      return NextResponse.json({
        success: false,
        message: "لا يمكن تنفيذ هذا الإجراء على المالك أو الأدمن",
      }, { status: 400 });
    }

    if (action === "changePassword") {
      if (!body.newPassword) {
        return NextResponse.json({
          success: false,
          message: "كلمة السر الجديدة مطلوبة",
        }, { status: 400 });
      }

      user.password = await hashPassword(body.newPassword);
      await user.save();

      return NextResponse.json({
        success: true,
        message: "تم تغيير كلمة السر بنجاح",
      });
    }

    if (action === "toggleBlock") {
      user.blocked = !Boolean(user.blocked);
      await user.save();

      return NextResponse.json({
        success: true,
        message: user.blocked ? "تم حظر الطالب" : "تم فك الحظر",
      });
    }

    if (action === "deleteUser") {
      await User.deleteOne({ _id: user._id });

      return NextResponse.json({
        success: true,
        message: "تم حذف الطالب",
      });
    }

    return NextResponse.json({
      success: false,
      message: "إجراء غير معروف",
    }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تنفيذ العملية",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
