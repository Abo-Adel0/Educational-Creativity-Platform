"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getCurrentUser } from "../../../utils/auth";

const getItemTypeName = (type) => {
  if (type === "video") return "فيديو";
  if (type === "pdf") return "ملف";
  if (type === "exam") return "امتحان";
  return "عنصر";
};

const TypeBadge = ({ children }) => (
  <span className="inline-flex items-center justify-center min-w-8 h-8 rounded-full border border-[var(--border-color)] text-[var(--gold-primary)] px-3">
    {children}
  </span>
);

export default function CoursePreviewPage() {
  const params = useParams();
  const courseId = params.id;

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

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
    let active = true;

    const fetchCourseData = async () => {
      try {
        setLoading(true);

        const [courseRes, lessonsRes] = await Promise.all([
          fetch(`/api/courses/${courseId}`, { cache: "no-store" }),
          fetch(`/api/lessons?courseId=${courseId}`, { cache: "no-store" }),
        ]);

        const courseData = await courseRes.json();
        const lessonsData = await lessonsRes.json();

        if (!active) return;

        if (!courseData.success) {
          setCourse(null);
          setLessons([]);
          return;
        }

        setCourse(courseData.course);
        setLessons(lessonsData.success ? lessonsData.lessons || [] : []);
      } catch (error) {
        if (active) {
          setCourse(null);
          setLessons([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }

    return () => {
      active = false;
    };
  }, [courseId]);

  const canOpenLessons = useMemo(() => {
    if (!user) return false;

    if (user.role === "owner" || user.role === "admin") {
      return true;
    }

    if (Array.isArray(user.paidCourses)) {
      return user.paidCourses.includes("all") || user.paidCourses.includes(courseId);
    }

    return user.paidCourses === "all";
  }, [user, courseId]);

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

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <section className="section-space">
        <div className="container-custom">
          {loading ? (
            <div className="glass-card p-10 text-center">
              <h1 className="text-3xl main-title">
                جاري تحميل الكورس...
              </h1>
            </div>
          ) : !course ? (
            <div className="glass-card p-10 text-center">
              <img
                src="/images/empty.png"
                alt="empty"
                className="w-[190px] mx-auto mb-6"
              />

              <h1 className="text-3xl main-title mb-4">
                الكورس غير موجود
              </h1>

              <Link href="/" className="primary-btn inline-block">
                الرجوع للرئيسية
              </Link>
            </div>
          ) : (
            <>
              <div className="glass-card p-6 md:p-10 mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-center">
                  <div>
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-[320px] md:h-[390px] object-cover rounded-[30px]"
                      />
                    ) : (
                      <div className="w-full h-[320px] md:h-[390px] rounded-[30px] glass-card flex items-center justify-center">
                        <TypeBadge>كورس</TypeBadge>
                      </div>
                    )}
                  </div>

                  <div className="text-center lg:text-right">
                    <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-5">
                      {course.title}
                    </h1>

                    {course.teacher && (
                      <p className="text-xl text-[var(--text-secondary)] mb-4">
                        المدرس: {course.teacher.name}
                      </p>
                    )}

                    <p className="text-2xl sub-title text-[var(--gold-primary)] mb-5">
                      السعر: {course.price} جنيه
                    </p>

                    {course.description && (
                      <p className="text-[var(--text-secondary)] leading-[2.2] text-lg">
                        {course.description}
                      </p>
                    )}

                    {!canOpenLessons && (
                      <div className="glass-card p-5 mt-7 text-center">
                        <p className="text-[var(--text-secondary)] leading-[2] mb-5">
                          يمكنك معاينة محتوى الكورس. فتح المحاضرات يتم بعد إرسال طلب الدفع وموافقة الإدارة.
                        </p>

                        {user ? (
                          <Link href={`/payment/${courseId}`} className="primary-btn inline-block">
                            دفع وفتح الكورس
                          </Link>
                        ) : (
                          <Link href={`/login?redirect=/payment/${courseId}`} className="primary-btn inline-block">
                            تسجيل الدخول للدفع
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">{stats.lessons}</h2>
                  <p className="text-[var(--text-secondary)]">محاضرات</p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">{stats.videos}</h2>
                  <p className="text-[var(--text-secondary)]">فيديوهات</p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">{stats.files}</h2>
                  <p className="text-[var(--text-secondary)]">ملفات</p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">{stats.exams}</h2>
                  <p className="text-[var(--text-secondary)]">امتحانات</p>
                </div>
              </div>

              <div className="glass-card p-6 md:p-10">
                <h2 className="text-3xl md:text-5xl main-title text-[var(--gold-primary)] text-center mb-8">
                  محاضرات الكورس
                </h2>

                {lessons.length === 0 ? (
                  <div className="text-center py-12">
                    <img src="/images/empty.png" alt="empty" className="w-[190px] mx-auto mb-6" />

                    <h3 className="text-2xl md:text-3xl main-title mb-4">
                      لا توجد محاضرات متاحة حاليًا
                    </h3>

                    <p className="text-[var(--text-secondary)]">
                      ستظهر المحاضرات هنا عند توفر محتوى الكورس.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lessons.map((lesson, index) => (
                      <div key={lesson._id} className="glass-card p-6 hover-lift">
                        <p className="text-[var(--gold-primary)] sub-title mb-3">
                          المحاضرة {index + 1}
                        </p>

                        <h3 className="text-2xl md:text-3xl main-title mb-4">
                          {lesson.title}
                        </h3>

                        {lesson.description && (
                          <p className="text-[var(--text-secondary)] leading-[2] mb-5">
                            {lesson.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-3 mb-6">
                          {lesson.items?.length > 0 ? (
                            lesson.items.map((item) => (
                              <span key={item._id || item.title} className="glass-card px-4 py-2 text-sm">
                                {getItemTypeName(item.type)}
                              </span>
                            ))
                          ) : (
                            <span className="glass-card px-4 py-2 text-sm">لا يوجد عناصر</span>
                          )}
                        </div>

                        {canOpenLessons ? (
                          <Link href={`/courses/${courseId}/lessons/${lesson._id}`} className="primary-btn block text-center">
                            فتح المحاضرة
                          </Link>
                        ) : user ? (
                          <Link href={`/payment/${courseId}`} className="glass-card p-4 block text-center text-[var(--gold-primary)]">
                            إرسال طلب الدفع لفتح المحاضرات
                          </Link>
                        ) : (
                          <Link href={`/login?redirect=/payment/${courseId}`} className="glass-card p-4 block text-center text-[var(--gold-primary)]">
                            سجل الدخول للدفع
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
