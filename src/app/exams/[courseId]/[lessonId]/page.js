"use client";

import { useState, useEffect } from "react";

import courses from "../../../../data/courses";

export default function ExamPage({ params }) {

  const [answers, setAnswers] =
    useState({});

  const [result, setResult] =
    useState(null);

  const [user, setUser] =
    useState(null);

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

      setUser(JSON.parse(savedUser));

    }

  }, []);

  if (!course || !lesson) {

    return (

      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-4xl font-bold">
          الامتحان غير موجود
        </h1>

      </main>

    );

  }

  const handleSubmit = () => {

    let correct = 0;

    lesson.exam.questions.forEach(
      (q, index) => {

        if (
          answers[index] ===
          q.correctAnswer
        ) {

          correct++;

        }

      }
    );

    const score =
      Math.round(
        (correct /
          lesson.exam.questions
            .length) *
          100
      );

    const passed =
      score >=
      lesson.exam.passingScore;

    setResult(score);

    if (user) {

      const results =
        JSON.parse(
          localStorage.getItem(
            "almobde3-results"
          ) || "[]"
        );

      const existingResult =
        results.find(
          (r) =>
            r.phone ===
              user.phone &&
            r.courseId ===
              course.id &&
            r.lessonId ===
              lesson.id
        );

      if (!existingResult) {

        results.push({

          phone: user.phone,

          studentName:
            user.name,

          courseId: course.id,

          lessonId: lesson.id,

          score,

          passed,

        });

        localStorage.setItem(
          "almobde3-results",
          JSON.stringify(results)
        );

      }

    }

  };

  return (

    <main className="min-h-screen bg-black text-white px-6 py-20">

      <h1 className="text-5xl font-extrabold text-center text-yellow-500 mb-20">
        امتحان {lesson.title}
      </h1>

      <div className="max-w-4xl mx-auto flex flex-col gap-10">

        {lesson.exam.questions.map(
          (question, qIndex) => (

            <div
              key={qIndex}
              className="border border-yellow-500 rounded-[35px] p-8 gold-glow"
            >

              <h2 className="text-3xl font-bold mb-8">
                {question.question}
              </h2>

              <div className="flex flex-col gap-4">

                {question.options.map(
                  (option, oIndex) => (

                    <button
                      key={oIndex}
                      onClick={() =>
                        setAnswers({
                          ...answers,
                          [qIndex]:
                            option,
                        })
                      }
                      className={`p-4 rounded-2xl border transition-all duration-300

                      ${
                        answers[qIndex] ===
                        option
                          ? "bg-yellow-500 text-black border-yellow-500"
                          : "border-yellow-500 hover:bg-yellow-500 hover:text-black"
                      }`}
                    >
                      {option}
                    </button>

                  )
                )}

              </div>

            </div>

          )
        )}

        <button
          onClick={handleSubmit}
          className="bg-yellow-500 text-black py-5 rounded-2xl text-2xl font-bold hover:scale-105 transition-all duration-300"
        >
          إنهاء الامتحان
        </button>

        {result !== null && (

          <div className="border border-yellow-500 rounded-[35px] p-10 text-center gold-glow">

            <h2 className="text-5xl font-extrabold text-yellow-500 mb-8">
              نتيجتك
            </h2>

            <p className="text-7xl font-extrabold mb-10">
              {result}%
            </p>

            {result >=
            lesson.exam.passingScore ? (

              <div>

                <p className="text-green-400 text-4xl font-bold mb-6">
                  ✅ لقد نجحت
                </p>

                <p className="text-gray-300 text-xl mb-10">
                  تم فتح المحاضرة التالية تلقائيًا
                </p>

                <a
                  href={`/courses/${course.id}`}
                  className="bg-yellow-500 text-black px-8 py-4 rounded-2xl text-2xl font-bold"
                >
                  العودة للكورس
                </a>

              </div>

            ) : (

              <div>

                <p className="text-red-400 text-4xl font-bold mb-6">
                  ❌ لم تنجح
                </p>

                <p className="text-gray-300 text-xl mb-10">
                  يجب إعادة الامتحان
                </p>

                <button
                  onClick={() =>
                    window.location.reload()
                  }
                  className="bg-red-500 px-8 py-4 rounded-2xl text-2xl font-bold"
                >
                  إعادة الامتحان
                </button>

              </div>

            )}

          </div>

        )}

      </div>

    </main>

  );
}