export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { connectDB } from "../../../lib/db";
import Lesson from "../../../models/Lesson";
import Course from "../../../models/Course";

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
      if (item.type === "video") {
        videosCount += 1;
      }

      if (item.type === "pdf") {
        filesCount += 1;
      }

      if (item.type === "exam") {
        examsCount += 1;
      }
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
   GET LESSONS
========================= */

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } =
      new URL(request.url);

    const courseId =
      searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الكورس مطلوب",
        },
        {
          status: 400,
        }
      );
    }

    const lessons = await Lesson.find({
      course: courseId,
      isPublished: true,
    }).sort({
      order: 1,
      createdAt: 1,
    });

    return NextResponse.json({
      success: true,
      lessons,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء جلب المحاضرات",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================
   CREATE LESSON
========================= */

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();

    const {
      courseId,
      title,
      description,
      items,
      lockedUntilExamPassed,
    } = body;

    if (!courseId || !title) {
      return NextResponse.json(
        {
          success: false,
          message: "رقم الكورس وعنوان المحاضرة مطلوبين",
        },
        {
          status: 400,
        }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "المحاضرة يجب أن تحتوي على عنصر واحد على الأقل",
        },
        {
          status: 400,
        }
      );
    }

    const course = await Course.findById(courseId);

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

    const lessonsCount = await Lesson.countDocuments({
      course: courseId,
      isPublished: true,
    });

    const orderedItems = cleanLessonItems(items);

    const lesson = await Lesson.create({
      course: courseId,
      title,
      description: description || "",
      items: orderedItems,
      order: lessonsCount + 1,
      isPublished: true,
      lockedUntilExamPassed:
        Boolean(lockedUntilExamPassed),
    });

    await updateCourseStats(courseId);

    return NextResponse.json(
      {
        success: true,
        message: "تم إضافة المحاضرة بنجاح",
        lesson,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء إضافة المحاضرة",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}