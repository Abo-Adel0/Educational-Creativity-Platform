"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function TeacherDetailsPage() {
  const params = useParams();
  const teacherId = params.id;

  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchTeacherData = async () => {
      try {
        setLoading(true);

        const [teachersRes, coursesRes] = await Promise.all([
          fetch("/api/teachers", { cache: "no-store" }),
          fetch("/api/courses", { cache: "no-store" }),
        ]);

        const teachersData = await teachersRes.json();
        const coursesData = await coursesRes.json();

        if (!active) return;

        const allTeachers = teachersData.success ? teachersData.teachers || [] : [];
        const currentTeacher = allTeachers.find((item) => String(item._id) === String(teacherId));

        setTeacher(currentTeacher || null);

        if (coursesData.success) {
          const teacherCourses = (coursesData.courses || []).filter((course) => {
            const courseTeacher = course.teacher;
            const courseTeacherId = typeof courseTeacher === "string" ? courseTeacher : courseTeacher?._id;
            return String(courseTeacherId || "") === String(teacherId);
          });

          setCourses(teacherCourses);
        } else {
          setCourses([]);
        }
      } catch {
        if (active) {
          setTeacher(null);
          setCourses([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (teacherId) fetchTeacherData();

    return () => {
      active = false;
    };
  }, [teacherId]);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <section className="section-space">
        <div className="container-custom">
          {loading ? (
            <div className="glass-card p-10 text-center">
              <h1 className="text-3xl main-title">جاري تحميل بيانات المدرس...</h1>
            </div>
          ) : !teacher ? (
            <div className="glass-card p-10 text-center">
              <img src="/images/empty.png" alt="empty" className="w-[190px] mx-auto mb-6" />
              <h1 className="text-3xl main-title mb-5">المدرس غير موجود</h1>
              <Link href="/teachers" className="primary-btn inline-block">الرجوع للمدرسين</Link>
            </div>
          ) : (
            <>
              <div className="glass-card p-7 md:p-12 mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-center">
                  <div>
                    {teacher.image ? (
                      <img src={teacher.image} alt={teacher.name} className="w-full h-[360px] md:h-[420px] object-cover rounded-[30px]" />
                    ) : (
                      <div className="w-full h-[360px] md:h-[420px] rounded-[30px] glass-card flex items-center justify-center text-[var(--gold-primary)]">
                        <span className="text-3xl sub-title">مدرس</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center lg:text-right">
                    <Link href="/teachers" className="glass-card px-5 py-3 inline-block mb-6">الرجوع للمدرسين</Link>
                    <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-5">{teacher.name}</h1>
                    <p className="text-2xl sub-title text-[var(--gold-primary)] mb-5">{teacher.subject}</p>
                    {teacher.description && <p className="text-[var(--text-secondary)] leading-[2.2] text-lg">{teacher.description}</p>}
                  </div>
                </div>
              </div>

              <div className="glass-card p-7 md:p-12">
                <h2 className="text-3xl md:text-5xl main-title text-[var(--gold-primary)] text-center mb-8">كورسات المدرس</h2>

                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <img src="/images/empty.png" alt="empty" className="w-[190px] mx-auto mb-6" />
                    <h3 className="text-2xl md:text-3xl main-title mb-4">لا توجد كورسات متاحة لهذا المدرس حاليًا</h3>
                    <p className="text-[var(--text-secondary)]">ستظهر كورسات المدرس هنا عند توفرها.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div key={course._id} className="glass-card p-6 hover-lift">
                        {course.image ? (
                          <img src={course.image} alt={course.title} className="w-full h-[260px] md:h-[300px] object-cover rounded-[26px] mb-5" />
                        ) : (
                          <div className="w-full h-[260px] md:h-[300px] rounded-[26px] glass-card flex items-center justify-center mb-5">
                            <span className="text-[var(--gold-primary)] sub-title">كورس</span>
                          </div>
                        )}

                        <h3 className="text-2xl main-title mb-3">{course.title}</h3>
                        <p className="text-[var(--gold-primary)] sub-title mb-5">السعر: {course.price} جنيه</p>

                        <Link href={`/courses/${course._id}`} className="primary-btn block text-center">معاينة الكورس</Link>
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
