"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import EmptyState from "../../components/EmptyState";
import Toast from "../../components/Toast";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const loadCourses = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "فشل جلب الكورسات");
      }

      setCourses(data.courses || []);
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء تحميل الكورسات");
      showToast(err.message || "حدث خطأ أثناء تحميل الكورسات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <section className="section-space pt-28 pb-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl main-title text-[var(--gold-primary)] mb-4">
              كورسات منصة المبدع
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto leading-8">
              تصفح الكورسات المتاحة واشترك لتصل إلى محتوى الفيديوهات والملفات التعليمية بشكل آمن ومنظم.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="glass-card p-10 text-center text-red-400">
              <p>{error}</p>
            </div>
          ) : courses.length === 0 ? (
            <EmptyState text="لم يتم تنزيل أي كورسات" />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="glass-card overflow-hidden rounded-[30px] border border-[var(--border-color)] shadow-xl"
                >
                  <div className="overflow-hidden">
                    <img
                      src={course.image || "/images/logo.png"}
                      alt={course.title}
                      loading="lazy"
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-white">{course.title}</h2>
                      <span className="text-sm text-[var(--text-secondary)]">{course.grade}</span>
                    </div>

                    <p className="text-[var(--text-secondary)] leading-7 mb-6 line-clamp-3">
                      {course.description || "لا يوجد وصف إضافي للكورس بعد."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-[var(--text-secondary)]">
                      <span>السعر: {course.price} EGP</span>
                      <span>المحاضرات: {course.lessonsCount || 0}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Link
                        href={`/courses/${course._id}`}
                        className="primary-btn text-center"
                      >
                        صفحة الكورس
                      </Link>

                      <Link
                        href={`/courses/${course._id}/lessons`}
                        className="border border-[var(--gold-primary)] text-[var(--gold-primary)] rounded-2xl py-3 text-center hover:bg-[var(--gold-primary)] hover:text-black transition-all duration-200"
                      >
                        عرض المحاضرات
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
