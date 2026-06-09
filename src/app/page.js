"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";


  const prepYears = [
  {
    id: 1,
    title: "الصف الأول الإعدادي",
    href: "/grades/first-prep",
  },
  {
    id: 2,
    title: "الصف الثاني الإعدادي",
    href: "/grades/second-prep",
  },
  {
    id: 3,
    title: "الصف الثالث الإعدادي",
    href: "/grades/third-prep",
  },
];

const secondaryYears = [
  {
    id: 4,
    title: "الصف الأول الثانوي",
    href: "/grades/first-secondary",
  },
  {
    id: 5,
    title: "الصف الثاني الثانوي",
    href: "/grades/second-secondary",
  },
  {
    id: 6,
    title: "الصف الثالث الثانوي",
    href: "/grades/third-secondary",
  },
];

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses", {
          cache: "no-store",
        });

        const data = await res.json();

        if (data.success) {
          const featured = (data.courses || []).filter(
            (course) => course.isFeatured
          );

          setFeaturedCourses(featured);
        } else {
          setFeaturedCourses([]);
        }
      } catch (error) {
        setFeaturedCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <Hero />

      {/* FEATURED COURSES */}

      <section className="section-space">
        <div className="container-custom">
          <div className="glass-card p-7 md:p-12 text-center">
            <h2 className="text-3xl md:text-5xl main-title text-[var(--gold-primary)] mb-8">
              الكورسات المميزة
            </h2>

            {loadingCourses ? (
              <div className="glass-card p-10">
                <h3 className="text-2xl main-title">
                  جاري تحميل الكورسات...
                </h3>
              </div>
            ) : featuredCourses.length === 0 ? (
              <div className="glass-card p-8 md:p-10">
                <img
                  src="/images/empty.png"
                  alt="لم يتم تنزيل أي كورسات"
                  className="w-[190px] md:w-[230px] mx-auto mb-6"
                />

                <h3 className="text-2xl md:text-3xl main-title mb-3">
                  لم يتم تنزيل أي كورسات
                </h3>

                <p className="text-[var(--text-secondary)] leading-[2]">
                  سيتم عرض الكورسات هنا بعد إضافتها من لوحة التحكم.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="glass-card p-5 text-right hover-lift"
                  >
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-[220px] object-cover rounded-[24px] mb-5"
                      />
                    ) : (
                      <div className="w-full h-[220px] rounded-[24px] glass-card flex items-center justify-center text-6xl mb-5">
                        📚
                      </div>
                    )}

                    <h3 className="text-2xl main-title mb-3">
                      {course.title}
                    </h3>

                    {course.teacher && (
                      <p className="text-[var(--text-secondary)] mb-3">
                        المدرس: {course.teacher.name}
                      </p>
                    )}

                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="glass-card p-3 text-center">
                        🎥 {course.videosCount || 0}
                      </div>

                      <div className="glass-card p-3 text-center">
                        📄 {course.filesCount || 0}
                      </div>

                      <div className="glass-card p-3 text-center">
                        📝 {course.examsCount || 0}
                      </div>
                    </div>

                    <Link
                      href="/login"
                      className="primary-btn block text-center"
                    >
                      الدخول للكورس
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PREP STAGE */}

      <section className="section-space">
        <div className="container-custom">
          <div className="glass-card p-7 md:p-12">
            <h2 className="text-3xl md:text-5xl main-title text-center text-[var(--gold-primary)] mb-10">
              المرحلة الإعدادية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {prepYears.map((year) => (
                <Link
                  key={year.id}
                  href={year.href}
                  className="glass-card p-8 md:p-10 text-center hover-lift block"
                >
                  <h3 className="text-2xl md:text-3xl sub-title">
                    {year.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECONDARY STAGE */}

      <section className="section-space">
        <div className="container-custom">
          <div className="glass-card p-7 md:p-12">
            <h2 className="text-3xl md:text-5xl main-title text-center text-[var(--gold-primary)] mb-10">
              المرحلة الثانوية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {secondaryYears.map((year) => (
                <Link
                  key={year.id}
                  href={year.href}
                  className="glass-card p-8 md:p-10 text-center hover-lift block"
                >
                  <h3 className="text-2xl md:text-3xl sub-title">
                    {year.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY PLATFORM */}

      <section className="section-space">
        <div className="container-custom">
          <div className="text-center mb-14">
            <h2 className="text-5xl md:text-7xl main-title text-white mb-5">
              لماذا تختار منصتنا؟
            </h2>

            <div className="w-[120px] h-[4px] mx-auto rounded-full bg-[var(--gold-primary)] shadow-[0_0_25px_rgba(245,188,66,0.8)] mb-8"></div>

            <p className="text-xl md:text-2xl text-[var(--text-secondary)] leading-[2] max-w-3xl mx-auto">
              نوفر لك تجربة تعليمية متكاملة ومميزة تساعدك على تحقيق أفضل النتائج.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-0 max-w-5xl mx-auto">
            <div className="rounded-[30px] border border-[var(--border-color)] bg-[#1b202b] px-6 py-12 md:px-10 md:py-14 text-center">
              <div className="w-[90px] h-[90px] mx-auto mb-8 flex items-center justify-center text-[var(--gold-primary)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5Zm0 2c-4.42 0-8 2.24-8 5v1c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-1c0-2.76-3.58-5-8-5Z" />
                </svg>
              </div>

              <h3 className="text-3xl md:text-4xl main-title text-white mb-5">
                خبرة تدريسية
              </h3>

              <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-[2] max-w-3xl mx-auto">
                شرح مبسط ومباشر من خبير متخصص في تدريس العلوم الشرعية للمرحلة الإعدادية والثانوية.
              </p>
            </div>

            <div className="rounded-[30px] border border-[var(--border-color)] bg-[#1b202b] px-6 py-12 md:px-10 md:py-14 text-center">
              <div className="w-[90px] h-[90px] mx-auto mb-8 flex items-center justify-center text-[var(--gold-primary)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M4 5.5C4 4.12 5.12 3 6.5 3H11v17H6.5C5.12 20 4 18.88 4 17.5v-12ZM13 3h4.5C18.88 3 20 4.12 20 5.5v12c0 1.38-1.12 2.5-2.5 2.5H13V3Z" />
                </svg>
              </div>

              <h3 className="text-3xl md:text-4xl main-title text-white mb-5">
                محتوى شامل
              </h3>

              <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-[2] max-w-3xl mx-auto">
                تغطية كاملة للمناهج الدراسية مع مذكرات وملخصات تساعدك على المراجعة الفعالة.
              </p>
            </div>

            <div className="rounded-[30px] border border-[var(--border-color)] bg-[#1b202b] px-6 py-12 md:px-10 md:py-14 text-center">
              <div className="w-[90px] h-[90px] mx-auto mb-8 flex items-center justify-center text-[var(--gold-primary)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-full h-full"
                >
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Zm-2-7.4h9v2H7v-2Zm0-4h9v2H7v-2Zm0 8h5v2H7v-2Z" />
                </svg>
              </div>

              <h3 className="text-3xl md:text-4xl main-title text-white mb-5">
                امتحانات تفاعلية
              </h3>

              <p className="text-lg md:text-xl text-[var(--text-secondary)] leading-[2] max-w-3xl mx-auto">
                بنك أسئلة ضخم وامتحانات دورية لقياس مستواك وتصحيح فوري لنتائجك.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKS */}

      <section className="section-space">
        <div className="container-custom">
          <div className="glass-card p-7 md:p-12 text-center">
            <h2 className="text-3xl md:text-5xl main-title text-[var(--gold-primary)] mb-6">
              المكتبة التعليمية
            </h2>

            <div className="glass-card p-8 md:p-10">
              <p className="text-[var(--text-secondary)] text-lg leading-[2] mb-8">
                هنا هتلاقي الكتب والمذكرات التعليمية بعد إضافتها من لوحة التحكم.
              </p>

              <Link
                href="/books"
                className="primary-btn inline-block"
              >
                الدخول إلى المكتبة
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}