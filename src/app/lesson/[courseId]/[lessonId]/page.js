"use client";

import { useEffect, useState } from "react";

import courses from "../../../../data/courses";

export default function LessonPage({ params }) {

  const [user, setUser] =
    useState(null);

  const [isSubscribed, setIsSubscribed] =
    useState(false);

  const course = courses.find(
    (c) => c.id === Number(params.courseId)
  );

  const lesson = course?.lessons.find(
    (l) => l.id === Number(params.lessonId)
  );

  useEffect(() => {

    const savedUser =
      localStorage.getItem(
        "almobde3-user"
      );

    if (savedUser) {

      const parsedUser =
        JSON.parse(savedUser);

      setUser(parsedUser);

      const subscriptions =
        JSON.parse(
          localStorage.getItem(
            "almobde3-subscriptions"
          ) || "[]"
        );

      const subscribed =
        subscriptions.find(
          (sub) =>
            sub.courseId === course.id &&
            sub.phone ===
              parsedUser.phone
        );

      if (
        subscribed ||
        parsedUser.role === "owner"
      ) {

        setIsSubscribed(true);

      }

    }

  }, [course]);

  if (!course || !lesson) {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-4xl font-bold">
          المحاضرة غير موجودة
        </h1>

      </main>

    );

  }

  const locked =
    !isSubscribed &&
    lesson.id !== 1;

  if (locked) {

    return (

      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

        <h1 className="text-5xl font-extrabold text-red-500 mb-8">
          🔒 المحاضرة مقفولة
        </h1>

        <p className="text-2xl text-gray-300 mb-10 text-center">
          يجب الاشتراك في الكورس أولًا لفتح هذه المحاضرة.
        </p>

        <a
          href={`/courses/${course.id}`}
          className="bg-yellow-500 text-black px-8 py-4 rounded-2xl text-2xl font-bold"
        >
          العودة للكورس
        </a>

      </main>

    );

  }

  return (

    <main className="min-h-screen bg-black text-white px-6 py-20">

      {/* TITLE */}

      <div className="text-center mb-20">

        <h1 className="text-6xl font-extrabold text-yellow-500 mb-6">
          {lesson.title}
        </h1>

        <p className="text-xl text-gray-300">
          {lesson.description}
        </p>

      </div>

      {/* VIDEO PLAYER */}

      <div className="max-w-6xl mx-auto border border-yellow-500 rounded-[40px] overflow-hidden gold-glow mb-20 relative">

        {/* WATERMARK */}

        <div className="absolute top-6 left-6 z-50 bg-black/60 px-4 py-2 rounded-xl text-yellow-500 font-bold">

          {user?.name || "طالب منصة المبدع"}

        </div>

        {/* VIDEO */}

        <video
          controls
          controlsList="nodownload"
          className="w-full"
        >

          <source
            src={lesson.video}
            type="video/mp4"
          />

        </video>

      </div>

      {/* PDF */}

      <div className="max-w-3xl mx-auto mb-20">

        <a
          href={lesson.pdf}
          target="_blank"
          className="block border border-yellow-500 text-center py-6 rounded-[30px] text-2xl hover:bg-yellow-500 hover:text-black transition-all duration-300"
        >
          📄 فتح الـ PDF
        </a>

      </div>

      {/* EXAM */}

      {lesson.exam && (

        <div className="max-w-3xl mx-auto">

          <a
            href={`/exams/${course.id}/${lesson.id}`}
            className="block border border-green-500 text-green-400 text-center py-6 rounded-[30px] text-2xl hover:bg-green-500 hover:text-black transition-all duration-300"
          >
            📝 دخول الامتحان
          </a>

        </div>

      )}

    </main>

  );
}