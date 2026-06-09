"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "../../components/ProtectedRoute";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    coursesCount: 0,
    teachersCount: 0,
    studentsCount: 0,
    loading: true,
  });

  const fetchStats = async () => {
    try {
      const [coursesRes, teachersRes] = await Promise.all([
        fetch("/api/courses", { cache: "no-store" }),
        fetch("/api/teachers", { cache: "no-store" }),
      ]);

      const coursesData = await coursesRes.json();
      const teachersData = await teachersRes.json();

      setStats({
        coursesCount: coursesData.courses?.length || 0,
        teachersCount: teachersData.teachers?.length || 0,
        studentsCount: 0,
        loading: false,
      });
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const dashboardCards = [
    {
      title: "إدارة المدرسين",
      description:
        "إضافة المدرسين وتعديل بياناتهم وصورهم وربطهم بالكورسات.",
      href: "/dashboard/teachers",
      icon: "م",
    },
    {
      title: "إدارة الكورسات",
      description:
        "إضافة الكورسات وربطها بالصفوف الدراسية وإدارة محتواها.",
      href: "/dashboard/courses",
      icon: "ك",
    },
    {
      title: "إدارة الكتب",
      description:
        "رفع الكتب والمذكرات التعليمية وتنظيمها داخل المكتبة.",
      href: "/dashboard/books",
      icon: "ب",
    },
    {
      title: "إدارة الطلاب",
      description:
        "عرض الطلاب وتغيير كلمة السر والحظر وفك الحظر.",
      href: "/dashboard/students",
      icon: "ط",
    },
    {
      title: "طلبات الدفع",
      description:
        "مراجعة مدفوعات Vodafone Cash وInstaPay وقبول أو رفض فتح الكورسات.",
      href: "/dashboard/payments",
      icon: "د",
    },
    {
      title: "إدارة الأدمنز",
      description:
        "إضافة أو إزالة الأدمنز والتحكم في صلاحيات المنصة.",
      href: "/dashboard/admins",
      icon: "ص",
    },
  ];

  return (
    <ProtectedRoute requireAdmin>
      <main
        className="
          min-h-screen
          bg-[var(--bg-primary)]
          text-[var(--text-primary)]
          overflow-hidden
          px-4
          py-8
        "
      >
        <section
          className="
            min-h-screen
            flex
            items-center
            justify-center
          "
        >
          <div className="container-custom">
            <div
              className="
                glass-card
                p-6
                md:p-10
              "
            >
              {/* STATS TOP */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                <div className="glass-card p-6 text-center">
                  <h3 className="text-5xl font-bold text-[var(--gold-primary)] mb-2">
                    {stats.loading ? "..." : stats.coursesCount}
                  </h3>

                  <p className="text-[var(--text-secondary)]">
                    كورسات مضافة
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h3 className="text-5xl font-bold text-[var(--gold-primary)] mb-2">
                    {stats.loading ? "..." : stats.teachersCount}
                  </h3>

                  <p className="text-[var(--text-secondary)]">
                    مدرسين
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h3 className="text-5xl font-bold text-[var(--gold-primary)] mb-2">
                    {stats.loading ? "..." : stats.studentsCount}
                  </h3>

                  <p className="text-[var(--text-secondary)]">
                    طلاب
                  </p>
                </div>
              </div>

              {/* HEADER */}

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  items-center
                  justify-between
                  gap-5
                  mb-10
                  text-center
                  md:text-right
                "
              >
                <div>
                  <h1
                    className="
                      text-4xl
                      md:text-6xl
                      main-title
                      text-[var(--gold-primary)]
                      mb-4
                    "
                  >
                    لوحة التحكم
                  </h1>

                  <p
                    className="
                      text-[var(--text-secondary)]
                      leading-[2]
                      max-w-2xl
                    "
                  >
                    من هنا يمكنك إدارة محتوى المنصة بالكامل من مدرسين وكورسات وكتب وطلاب وصلاحيات.
                  </p>
                </div>

                <Link
                  href="/"
                  className="
                    primary-btn
                    whitespace-nowrap
                  "
                >
                  الرجوع للمنصة
                </Link>
              </div>

              {/* CARDS */}

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  lg:grid-cols-3
                  gap-6
                "
              >
                {dashboardCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="
                      glass-card
                      p-7
                      hover-lift
                      block
                      min-h-[220px]
                      flex
                      flex-col
                      justify-between
                    "
                  >
                    <div>
                      <div className="w-16 h-16 rounded-full border border-[var(--border-color)] flex items-center justify-center text-3xl text-[var(--gold-primary)] mb-5">
                        {card.icon}
                      </div>

                      <h2
                        className="
                          text-2xl
                          md:text-3xl
                          main-title
                          mb-4
                        "
                      >
                        {card.title}
                      </h2>

                      <p
                        className="
                          text-[var(--text-secondary)]
                          leading-[2]
                        "
                      >
                        {card.description}
                      </p>
                    </div>

                    <div
                      className="
                        mt-6
                        text-[var(--gold-primary)]
                        sub-title
                        text-lg
                      "
                    >
                      فتح القسم ←
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}