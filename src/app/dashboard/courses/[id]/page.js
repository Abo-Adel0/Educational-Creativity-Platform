"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import ProtectedRoute from "../../../../components/ProtectedRoute";
import Toast from "../../../../components/Toast";

export default function DashboardCourseDetailsPage() {
  const params = useParams();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const fetchCourseAndLessons = async () => {
    try {
      setLoading(true);

      const courseRes = await fetch(`/api/courses/${courseId}`, {
        cache: "no-store",
      });

      const courseData = await courseRes.json();

      if (!courseData.success) {
        showToast(courseData.message || "فشل جلب الكورس", "error");
        setCourse(null);
        return;
      }

      setCourse(courseData.course);

      const lessonsRes = await fetch(`/api/lessons?courseId=${courseId}`, {
        cache: "no-store",
      });

      const lessonsData = await lessonsRes.json();

      if (!lessonsData.success) {
        showToast(lessonsData.message || "فشل جلب المحاضرات", "error");
        setLessons([]);
        return;
      }

      setLessons(lessonsData.lessons || []);
    } catch (error) {
      showToast("حدث خطأ أثناء تحميل بيانات الكورس", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseAndLessons();
    }
  }, [courseId]);

  const stats = useMemo(() => {
    let videos = 0;
    let files = 0;
    let exams = 0;

    lessons.forEach((lesson) => {
      lesson.items?.forEach((item) => {
        if (item.type === "video") videos += 1;
        if (item.type === "pdf") files += 1;
        if (item.type === "exam") exams += 1;
      });
    });

    return {
      lessons: lessons.length,
      videos,
      files,
      exams,
    };
  }, [lessons]);

  const handleDeleteLesson = async (lessonId) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل حذف المحاضرة", "error");
        return;
      }

      showToast("تم حذف المحاضرة", "success");
      fetchCourseAndLessons();
    } catch (error) {
      showToast("حدث خطأ أثناء حذف المحاضرة", "error");
    }
  };

  const getItemTypeName = (type) => {
    if (type === "video") return "فيديو";
    if (type === "pdf") return "PDF";
    if (type === "exam") return "امتحان";
    return "عنصر";
  };

  return (
    <ProtectedRoute requireAdmin>
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-8">
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({
              ...toast,
              show: false,
            })
          }
        />

        <section className="min-h-screen flex items-center justify-center">
          <div className="container-custom">
            <div className="glass-card p-6 md:p-10">
              {/* TOP */}

              <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-10 text-center md:text-right">
                <div>
                  <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-4">
                    {course?.title || "إدارة الكورس"}
                  </h1>

                  <p className="text-[var(--text-secondary)] leading-[2] max-w-3xl">
                    من هنا تقدر تضيف وتدير محاضرات الكورس، وكل محاضرة ممكن تحتوي على فيديوهات وملفات PDF وامتحانات بنفس الترتيب.
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <Link
                    href="/dashboard/courses"
                    className="glass-card p-4 text-center"
                  >
                    الرجوع للكورسات
                  </Link>

                  <Link
                    href="/dashboard"
                    className="primary-btn text-center"
                  >
                    الداشبورد
                  </Link>
                </div>
              </div>

              {loading ? (
                <div className="glass-card p-10 text-center">
                  <h2 className="text-2xl main-title">
                    جاري تحميل بيانات الكورس...
                  </h2>
                </div>
              ) : !course ? (
                <div className="glass-card p-10 text-center">
                  <img
                    src="/images/empty.png"
                    alt="empty"
                    className="w-[170px] mx-auto mb-6"
                  />

                  <h2 className="text-2xl main-title mb-4">
                    الكورس غير موجود
                  </h2>

                  <p className="text-[var(--text-secondary)] mb-7">
                    ارجع لصفحة الكورسات وتأكد إن الكورس موجود.
                  </p>

                  <Link
                    href="/dashboard/courses"
                    className="primary-btn inline-block"
                  >
                    الرجوع للكورسات
                  </Link>
                </div>
              ) : (
                <>
                  {/* COURSE INFO */}

                  <div className="glass-card p-6 md:p-8 mb-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-center">
                      <div>
                        {course.image ? (
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-[260px] object-cover rounded-[26px]"
                          />
                        ) : (
                          <div className="w-full h-[260px] rounded-[26px] glass-card flex items-center justify-center text-7xl">
                            📚
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="text-3xl md:text-4xl main-title mb-4">
                          {course.title}
                        </h2>

                        <p className="text-[var(--gold-primary)] sub-title text-xl mb-4">
                          السعر: {course.price} جنيه
                        </p>

                        <p className="text-[var(--text-secondary)] mb-4">
                          الصف: {course.grade}
                        </p>

                        {course.teacher && (
                          <p className="text-[var(--text-secondary)] mb-4">
                            المدرس: {course.teacher.name}
                          </p>
                        )}

                        {course.description && (
                          <p className="text-[var(--text-secondary)] leading-[2]">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* STATS */}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
                    <div className="glass-card p-6 text-center">
                      <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                        {stats.lessons}
                      </h2>
                      <p className="text-[var(--text-secondary)]">
                        محاضرات
                      </p>
                    </div>

                    <div className="glass-card p-6 text-center">
                      <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                        {stats.videos}
                      </h2>
                      <p className="text-[var(--text-secondary)]">
                        فيديوهات
                      </p>
                    </div>

                    <div className="glass-card p-6 text-center">
                      <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                        {stats.files}
                      </h2>
                      <p className="text-[var(--text-secondary)]">
                        ملفات PDF
                      </p>
                    </div>

                    <div className="glass-card p-6 text-center">
                      <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                        {stats.exams}
                      </h2>
                      <p className="text-[var(--text-secondary)]">
                        امتحانات
                      </p>
                    </div>
                  </div>

                  {/* ADD LESSON */}

                  <div className="glass-card p-6 md:p-8 mb-10 text-center">
                    <h2 className="text-2xl md:text-3xl main-title mb-5">
                      محاضرات الكورس
                    </h2>

                    <p className="text-[var(--text-secondary)] leading-[2] mb-7">
                      اضغط على إضافة محاضرة لبناء محاضرة كاملة بعناصر مرتبة: فيديو، PDF، امتحان، فيديو حل، ملف مراجعة، امتحان آخر.
                    </p>

                    <Link
                      href={`/dashboard/courses/${courseId}/lessons/new`}
                      className="primary-btn inline-block"
                    >
                      إضافة محاضرة
                    </Link>
                  </div>

                  {/* LESSONS LIST */}

                  <div className="glass-card p-6 md:p-8">
                    <h2 className="text-2xl md:text-3xl main-title mb-6">
                      المحاضرات المضافة
                    </h2>

                    {lessons.length === 0 ? (
                      <div className="text-center py-12">
                        <img
                          src="/images/empty.png"
                          alt="empty"
                          className="w-[170px] mx-auto mb-6"
                        />

                        <h3 className="text-2xl main-title">
                          لم يتم تنزيل أي محاضرات
                        </h3>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {lessons.map((lesson, index) => (
                          <div
                            key={lesson._id}
                            className="glass-card p-6"
                          >
                            <p className="text-[var(--gold-primary)] sub-title mb-3">
                              محاضرة رقم {index + 1}
                            </p>

                            <h3 className="text-2xl main-title mb-4">
                              {lesson.title}
                            </h3>

                            {lesson.description && (
                              <p className="text-[var(--text-secondary)] leading-[2] mb-5">
                                {lesson.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-3 mb-6">
                              <span className="glass-card px-4 py-2">
                                العناصر: {lesson.items?.length || 0}
                              </span>

                              {lesson.items?.slice(0, 3).map((item) => (
                                <span
                                  key={item._id || item.title}
                                  className="glass-card px-4 py-2"
                                >
                                  {getItemTypeName(item.type)}
                                </span>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Link
                                href={`/dashboard/courses/${courseId}/lessons/${lesson._id}`}
                                className="primary-btn text-center"
                              >
                                تعديل المحاضرة
                              </Link>

                              <button
                                onClick={() =>
                                  handleDeleteLesson(lesson._id)
                                }
                                className="glass-card p-4 text-red-400"
                              >
                                حذف المحاضرة
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}