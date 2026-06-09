"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getCurrentUser } from "../../../utils/auth";

const gradeNames = {
  "first-prep": "الصف الأول الإعدادي",
  "second-prep": "الصف الثاني الإعدادي",
  "third-prep": "الصف الثالث الإعدادي",
  "first-secondary": "الصف الأول الثانوي",
  "second-secondary": "الصف الثاني الثانوي",
  "third-secondary": "الصف الثالث الثانوي",
};

const MiniIcon = ({ children }) => (
  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--border-color)] text-[var(--gold-primary)]">
    {children}
  </span>
);

export default function GradePage() {
  const params = useParams();
  const router = useRouter();

  const grade = params.grade;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const gradeTitle = useMemo(() => {
    return gradeNames[grade] || "الصف الدراسي";
  }, [grade]);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      const user = await getCurrentUser();

      if (!active) return;

      if (!user) {
        router.push(`/login?redirect=/grades/${grade}`);
        return;
      }

      setCheckingAuth(false);
    };

    checkUser();

    return () => {
      active = false;
    };
  }, [router, grade]);

  useEffect(() => {
    if (checkingAuth) return;

    let active = true;

    const fetchCourses = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/courses", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!active) return;

        if (data.success) {
          const filteredCourses = (data.courses || []).filter(
            (course) => course.grade === grade
          );

          setCourses(filteredCourses);
        } else {
          setCourses([]);
        }
      } catch (error) {
        if (active) setCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCourses();

    return () => {
      active = false;
    };
  }, [checkingAuth, grade]);

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl main-title">
            جاري التحقق من الحساب...
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <section className="section-space">
        <div className="container-custom">
          <div className="glass-card p-7 md:p-12 text-center mb-10">
            <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-6">
              {gradeTitle}
            </h1>

            <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-[2]">
              كورسات هذا الصف تظهر هنا بشكل منظم بمجرد توفرها.
            </p>
          </div>

          {loading ? (
            <div className="glass-card p-10 text-center">
              <h2 className="text-2xl main-title">
                جاري تحميل الكورسات...
              </h2>
            </div>
          ) : courses.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <img
                src="/images/empty.png"
                alt="لا يوجد كورسات"
                className="w-[190px] md:w-[230px] mx-auto mb-6"
              />

              <h2 className="text-2xl md:text-3xl main-title mb-4">
                لا توجد كورسات متاحة حاليًا
              </h2>

              <p className="text-[var(--text-secondary)] leading-[2]">
                تابع الصفحة، وسيظهر المحتوى هنا عند توفر الكورسات.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="glass-card p-6 hover-lift"
                >
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-[260px] md:h-[300px] object-cover rounded-[26px] mb-5"
                    />
                  ) : (
                    <div className="w-full h-[260px] md:h-[300px] rounded-[26px] glass-card flex items-center justify-center mb-5">
                      <MiniIcon>ك</MiniIcon>
                    </div>
                  )}

                  <h2 className="text-2xl md:text-3xl main-title mb-3">
                    {course.title}
                  </h2>

                  {course.teacher && (
                    <p className="text-[var(--text-secondary)] mb-3">
                      المدرس: {course.teacher.name}
                    </p>
                  )}

                  <p className="text-[var(--gold-primary)] sub-title text-xl mb-5">
                    السعر: {course.price} جنيه
                  </p>

                  <div className="grid grid-cols-3 gap-3 mb-5 text-center">
                    <div className="glass-card p-3">
                      <MiniIcon>ف</MiniIcon>
                      <p className="mt-2">{course.videosCount || 0}</p>
                    </div>

                    <div className="glass-card p-3">
                      <MiniIcon>م</MiniIcon>
                      <p className="mt-2">{course.filesCount || 0}</p>
                    </div>

                    <div className="glass-card p-3">
                      <MiniIcon>ا</MiniIcon>
                      <p className="mt-2">{course.examsCount || 0}</p>
                    </div>
                  </div>

                  <Link
                    href={`/courses/${course._id}`}
                    className="primary-btn block text-center"
                  >
                    معاينة الكورس
                  </Link>
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
