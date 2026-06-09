"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Navbar from "../../../../../components/Navbar";
import Footer from "../../../../../components/Footer";
import { getCurrentUser } from "../../../../../utils/auth";

const getItemTypeName = (type) => {
  if (type === "video") return "فيديو";
  if (type === "pdf") return "ملف PDF";
  if (type === "exam") return "امتحان";
  return "عنصر";
};

const getItemIcon = (type) => {
  if (type === "video") return "ف";
  if (type === "pdf") return "م";
  if (type === "exam") return "ا";
  return "ع";
};

const isMp4Url = (url) => {
  return String(url || "").toLowerCase().includes(".mp4");
};

const getYoutubeEmbed = (url) => {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    return url;
  } catch {
    return url;
  }
};

export default function LessonViewPage() {
  const params = useParams();

  const courseId = params.id;
  const lessonId = params.lessonId;

  const [user, setUser] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      if (active) setUser(currentUser);
    };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);

        const lessonRes = await fetch(`/api/lessons/${lessonId}`, {
          cache: "no-store",
        });

        const lessonData = await lessonRes.json();

        if (!lessonData.success) {
          setLesson(null);
          setCourse(null);
          return;
        }

        setLesson(lessonData.lesson);

        const courseRes = await fetch(`/api/courses/${courseId}`, {
          cache: "no-store",
        });

        const courseData = await courseRes.json();

        if (courseData.success) {
          setCourse(courseData.course);
        } else {
          setCourse(null);
        }
      } catch (error) {
        setLesson(null);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) {
      fetchLessonData();
    }
  }, [courseId, lessonId]);

  const canOpenLesson = useMemo(() => {
    if (!user) return false;

    if (user.role === "owner" || user.role === "admin") {
      return true;
    }

    if (Array.isArray(user.paidCourses)) {
      return user.paidCourses.includes("all") || user.paidCourses.includes(courseId);
    }

    return user.paidCourses === "all";
  }, [user, courseId]);

  const sortedItems = useMemo(() => {
    if (!lesson?.items) return [];

    return [...lesson.items].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    );
  }, [lesson]);

  const renderVideo = (item) => {
    if (item.videoProvider === "cloudflare" && item.cloudflareVideoId) {
      return (
        <div className="w-full aspect-video rounded-[28px] overflow-hidden glass-card">
          <iframe
            src={`https://iframe.videodelivery.net/${item.cloudflareVideoId}`}
            className="w-full h-full"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        </div>
      );
    }

    if (item.url && isMp4Url(item.url)) {
      return (
        <video
          src={item.url}
          controls
          controlsList="nodownload"
          className="w-full rounded-[28px] glass-card"
        />
      );
    }

    if (item.url) {
      return (
        <div className="w-full aspect-video rounded-[28px] overflow-hidden glass-card">
          <iframe
            src={getYoutubeEmbed(item.url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <div className="glass-card p-8 text-center">
        <p className="text-[var(--text-secondary)]">
          لم يتم إضافة رابط الفيديو بعد.
        </p>
      </div>
    );
  };

  const renderPdf = (item) => {
    if (!item.url) {
      return (
        <div className="glass-card p-8 text-center">
          <p className="text-[var(--text-secondary)]">
            لم يتم إضافة ملف PDF بعد.
          </p>
        </div>
      );
    }

    return (
      <div className="glass-card p-4">
        <div className="w-full h-[520px] rounded-[24px] overflow-hidden bg-white">
          <iframe
            src={item.url}
            className="w-full h-full"
          />
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="primary-btn block text-center mt-5"
        >
          فتح ملف PDF في صفحة جديدة
        </a>
      </div>
    );
  };

  const chooseAnswer = (examId, questionIndex, optionIndex) => {
    setAnswers({
      ...answers,
      [`${examId}-${questionIndex}`]: optionIndex,
    });
  };

  const submitExam = (examItem) => {
    const examId = examItem._id || examItem.id || examItem.title;

    const questions = Array.isArray(examItem.questions)
      ? examItem.questions
      : [];

    let totalMarks = 0;
    let studentMarks = 0;

    questions.forEach((question, index) => {
      const mark = Number(question.mark) || 1;

      totalMarks += mark;

      const selectedAnswer = answers[`${examId}-${index}`];

      if (Number(selectedAnswer) === Number(question.correctIndex)) {
        studentMarks += mark;
      }
    });

    const percentage =
      totalMarks > 0
        ? Math.round((studentMarks / totalMarks) * 100)
        : 0;

    const passed = percentage >= Number(examItem.passScore || 50);

    setResults({
      ...results,
      [examId]: {
        totalMarks,
        studentMarks,
        percentage,
        passed,
      },
    });
  };

  const renderExam = (item) => {
    const examId = item._id || item.id || item.title;

    const questions = Array.isArray(item.questions)
      ? item.questions
      : [];

    const result = results[examId];

    return (
      <div className="glass-card p-6">
        <h3 className="text-2xl md:text-3xl main-title mb-4">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-[var(--text-secondary)] leading-[2] mb-6">
            {item.description}
          </p>
        )}

        <div className="glass-card p-4 mb-6 text-center">
          <p className="text-[var(--text-secondary)]">
            درجة النجاح:{" "}
            <span className="text-[var(--gold-primary)] font-bold">
              {item.passScore || 50}%
            </span>
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-[var(--text-secondary)]">
              الامتحان لم يتم تجهيز أسئلته بعد.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {questions.map((question, index) => (
              <div
                key={question._id || question.id || index}
                className="glass-card p-5"
              >
                <h4 className="text-xl sub-title mb-4 leading-[2]">
                  {index + 1}. {question.text}
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {(question.options || []).map((option, optionIndex) => {
                    const selected =
                      answers[`${examId}-${index}`] === optionIndex;

                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        onClick={() =>
                          chooseAnswer(examId, index, optionIndex)
                        }
                        className={
                          selected
                            ? "primary-btn text-right"
                            : "glass-card p-4 text-right hover-lift"
                        }
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={() => submitExam(item)}
              className="primary-btn"
            >
              تسليم الامتحان
            </button>

            {result && (
              <div className="glass-card p-6 text-center">
                <h4 className="text-2xl main-title mb-4">
                  النتيجة
                </h4>

                <p className="text-[var(--text-secondary)] mb-3">
                  الدرجة: {result.studentMarks} من {result.totalMarks}
                </p>

                <p className="text-[var(--text-secondary)] mb-3">
                  النسبة: {result.percentage}%
                </p>

                <p
                  className={
                    result.passed
                      ? "text-green-400 text-xl sub-title"
                      : "text-red-400 text-xl sub-title"
                  }
                >
                  {result.passed
                    ? "ناجح، أحسنت يا بطل"
                    : "لم تصل لدرجة النجاح، حاول مرة أخرى"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <section className="section-space">
        <div className="container-custom">
          {loading ? (
            <div className="glass-card p-10 text-center">
              <h1 className="text-3xl main-title">
                جاري تحميل المحاضرة...
              </h1>
            </div>
          ) : !lesson ? (
            <div className="glass-card p-10 text-center">
              <img
                src="/images/empty.png"
                alt="empty"
                className="w-[190px] mx-auto mb-6"
              />

              <h1 className="text-3xl main-title mb-5">
                المحاضرة غير موجودة
              </h1>

              <Link
                href={`/courses/${courseId}`}
                className="primary-btn inline-block"
              >
                الرجوع للكورس
              </Link>
            </div>
          ) : !canOpenLesson ? (
            <div className="glass-card p-10 text-center">
              <h1 className="text-4xl main-title text-[var(--gold-primary)] mb-5">
                هذه المحاضرة مقفولة
              </h1>

              <p className="text-[var(--text-secondary)] leading-[2] mb-8">
                يجب تسجيل الدخول والاشتراك في الكورس حتى تتمكن من فتح المحاضرات.
              </p>

              <Link
                href={`/login?redirect=/courses/${courseId}/lessons/${lessonId}`}
                className="primary-btn inline-block"
              >
                تسجيل الدخول
              </Link>
            </div>
          ) : (
            <>
              <div className="glass-card p-7 md:p-12 text-center mb-10">
                <Link
                  href={`/courses/${courseId}`}
                  className="glass-card px-5 py-3 inline-block mb-7"
                >
                  الرجوع للكورس
                </Link>

                {course && (
                  <p className="text-[var(--gold-primary)] sub-title mb-4">
                    {course.title}
                  </p>
                )}

                <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-6">
                  {lesson.title}
                </h1>

                {lesson.description && (
                  <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-[2] max-w-4xl mx-auto">
                    {lesson.description}
                  </p>
                )}
              </div>

              {sortedItems.length === 0 ? (
                <div className="glass-card p-10 text-center">
                  <img
                    src="/images/empty.png"
                    alt="empty"
                    className="w-[190px] mx-auto mb-6"
                  />

                  <h2 className="text-3xl main-title">
                    لم يتم تنزيل أي محتوى داخل المحاضرة
                  </h2>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {sortedItems.map((item, index) => (
                    <div
                      key={item._id || item.id || index}
                      className="glass-card p-6 md:p-8"
                    >
                      <div className="mb-6">
                        <p className="text-[var(--gold-primary)] sub-title mb-3">
                          {index + 1}. {getItemIcon(item.type)}{" "}
                          {getItemTypeName(item.type)}
                        </p>

                        <h2 className="text-3xl md:text-4xl main-title mb-4">
                          {item.title}
                        </h2>

                        {item.description && (
                          <p className="text-[var(--text-secondary)] leading-[2]">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {item.type === "video" && renderVideo(item)}
                      {item.type === "pdf" && renderPdf(item)}
                      {item.type === "exam" && renderExam(item)}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}