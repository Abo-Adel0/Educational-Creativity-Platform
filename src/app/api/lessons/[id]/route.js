export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { connectDB } from "../../../../lib/db";
import Lesson from "../../../../models/Lesson";
import Course from "../../../../models/Course";

/* =========================
   UPDATE COURSE STATS
========================= */

async function updateCourseStats(courseId) {
  const lessons = await Lesson.find({
    course: courseId,
    isPublished: true,
  });

  let videosCount = 0;
  let filesCount = 0;
  let examsCount = 0;

  lessons.forEach((lesson) => {
    lesson.items.forEach((item) => {
      if (item.type === "video") videosCount += 1;
      if (item.type === "pdf") filesCount += 1;
      if (item.type === "exam") examsCount += 1;
    });
  });

  await Course.findByIdAndUpdate(courseId, {
    lessonsCount: lessons.length,
    videosCount,
    filesCount,
    examsCount,
  });
}

/* =========================
   CLEAN QUESTIONS
========================= */

function cleanQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  return questions
    .filter((question) => question?.text)
    .map((question) => {
      const options = Array.isArray(question.options)
        ? question.options.filter(Boolean)
        : [];

      return {
        text: question.text,
        options,
        correctIndex: Number(question.correctIndex) || 0,
        mark: Number(question.mark) || 1,
      };
    });
}

/* =========================
   CLEAN ITEMS
========================= */

function cleanLessonItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const type = item.type;

    const cleanItem = {
      type,
      title: item.title,
      description: item.description || "",
      url: item.url || "",
      order: index + 1,
      videoProvider: item.videoProvider || "",
      cloudflareVideoId: item.cloudflareVideoId || "",
      passScore: Number(item.passScore) || 50,
      questions: [],
    };

    if (type === "exam") {
      cleanItem.url = "";
      cleanItem.videoProvider = "";
      cleanItem.cloudflareVideoId = "";
      cleanItem.questions = cleanQuestions(item.questions);
    }

    return cleanItem;
  });
}

/* =========================
   GET SINGLE LESSON
========================= */

export async function GET(request, { params }) {
  try {
    await connectDB();

    const lesson = await Lesson.findById(params.id).populate("course");

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "المحاضرة غير موجودة",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      lesson,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب المحاضرة",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   UPDATE LESSON
========================= */

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      title,
      description,
      items,
      order,
      isPublished,
      lockedUntilExamPassed,
    } = body;

    const lesson = await Lesson.findById(params.id);

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "المحاضرة غير موجودة",
        },
        {
          status: 404,
        }
      );
    }

    if (title !== undefined) {
      lesson.title = title;
    }

    if (description !== undefined) {
      lesson.description = description;
    }

    if (order !== undefined) {
      lesson.order = Number(order) || lesson.order;
    }

    if (isPublished !== undefined) {
      lesson.isPublished = Boolean(isPublished);
    }

    if (lockedUntilExamPassed !== undefined) {
      lesson.lockedUntilExamPassed = Boolean(lockedUntilExamPassed);
    }

    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return NextResponse.json(
          {
            success: false,
            message: "عناصر المحاضرة يجب أن تكون قائمة",
          },
          {
            status: 400,
          }
        );
      }

      lesson.items = cleanLessonItems(items);
    }

    await lesson.save();

    await updateCourseStats(lesson.course);

    return NextResponse.json({
      success: true,
      message: "تم تعديل المحاضرة بنجاح",
      lesson,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء تعديل المحاضرة",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   DELETE LESSON
========================= */

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const lesson = await Lesson.findById(params.id);

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          message: "المحاضرة غير موجودة",
        },
        {
          status: 404,
        }
      );
    }

    lesson.isPublished = false;

    await lesson.save();

    await updateCourseStats(lesson.course);

    return NextResponse.json({
      success: true,
      message: "تم حذف المحاضرة بنجاح",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء حذف المحاضرة",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}