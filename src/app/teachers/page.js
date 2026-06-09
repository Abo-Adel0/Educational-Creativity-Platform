"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const TeacherIcon = () => (
  <svg viewBox="0 0 24 24" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
    <path d="M4 21a8 8 0 0 1 16 0" />
    <path d="M18 8h3v9" />
  </svg>
);

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchTeachers = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/teachers", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        setTeachers(data.success ? data.teachers || [] : []);
      } catch {
        if (active) setTeachers([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTeachers();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <section className="section-space">
        <div className="container-custom">
          <div className="glass-card p-7 md:p-12 text-center mb-10">
            <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-6">
              المدرسين
            </h1>

            <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-[2] max-w-3xl mx-auto">
              اختر المدرس المناسب وتصفح كورساته المتاحة داخل المنصة.
            </p>
          </div>

          {loading ? (
            <div className="glass-card p-10 text-center">
              <h2 className="text-2xl main-title">جاري تحميل المدرسين...</h2>
            </div>
          ) : teachers.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <img src="/images/empty.png" alt="لا يوجد مدرسين" className="w-[190px] md:w-[230px] mx-auto mb-6" />

              <h2 className="text-2xl md:text-3xl main-title mb-4">
                لا يوجد مدرسين متاحين حاليًا
              </h2>

              <p className="text-[var(--text-secondary)] leading-[2]">
                ستظهر بيانات المدرسين هنا عند توفرها.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <div key={teacher._id} className="glass-card p-6 text-center hover-lift">
                  <div className="mb-6">
                    {teacher.image ? (
                      <img src={teacher.image} alt={teacher.name} className="w-full h-[300px] md:h-[340px] object-cover rounded-[28px]" />
                    ) : (
                      <div className="w-full h-[300px] md:h-[340px] rounded-[28px] glass-card flex items-center justify-center text-[var(--gold-primary)]">
                        <TeacherIcon />
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl main-title mb-3">{teacher.name}</h2>

                  <p className="text-[var(--gold-primary)] sub-title text-lg mb-4">{teacher.subject}</p>

                  {teacher.description && (
                    <p className="text-[var(--text-secondary)] leading-[2] mb-6">{teacher.description}</p>
                  )}

                  <Link href={`/teachers/${teacher._id}`} className="primary-btn inline-block">
                    عرض كورسات المدرس
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
