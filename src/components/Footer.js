"use client";

import Link from "next/link";
import { useEffect, useState } from "react";


export default function Footer() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const currentUser = await (
          await import("../utils/auth")
        ).fetchCurrentUser();

        if (mounted) setUser(currentUser);
      } catch {
        if (mounted) setUser(null);
      }
    })();

    return () => (mounted = false);
  }, []);

  const canAccessDashboard =
    user?.role === "owner" ||
    user?.role === "admin";

  return (
    <footer
      className="
      section-space
      pt-16
      pb-10
      mt-20
      border-t
      border-[var(--border-color)]
      relative
      overflow-hidden
    "
    >
      {/* GLOW */}

      <div
        className="
        absolute
        bottom-[-120px]
        left-[-120px]
        w-[300px]
        h-[300px]
        rounded-full
        bg-yellow-400/10
        blur-[120px]
      "
      />

      <div
        className="
        container-custom
        relative
        z-10
      "
      >
        {/* TOP */}

        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-10
          mb-14
        "
        >
          {/* ABOUT */}

          <div>
            <h2
              className="
              text-3xl
              main-title
              text-[var(--gold-primary)]
              mb-5
            "
            >
              منصة المبدع
            </h2>

            <p
              className="
              text-[var(--text-secondary)]
              leading-[2.2]
            "
            >
              منصة تعليمية حديثة للأستاذ محمود بن وهبه الأزهري، تهدف لتقديم تجربة تعليمية منظمة ومريحة لطلاب المرحلة الإعدادية والثانوية.
            </p>
          </div>

          {/* LINKS */}

          <div>
            <h3
              className="
              text-2xl
              mb-5
              sub-title
            "
            >
              روابط سريعة
            </h3>

            <div
              className="
              flex
              flex-col
              gap-4
            "
            >
              <Link
                href="/"
                className="
                nav-link
                smooth-transition
                hover:text-[var(--gold-primary)]
              "
              >
                الرئيسية
              </Link>

              <Link
                href="/teachers"
                className="
                nav-link
                smooth-transition
                hover:text-[var(--gold-primary)]
              "
              >
                المدرسين
              </Link>

              <Link
                href="/books"
                className="
                nav-link
                smooth-transition
                hover:text-[var(--gold-primary)]
              "
              >
                الكتب
              </Link>

              <a
                href="https://wa.me/201065955112"
                target="_blank"
                rel="noopener noreferrer"
                className="
                nav-link
                smooth-transition
                hover:text-[var(--gold-primary)]
              "
              >
                تواصل معنا
              </a>

              {canAccessDashboard && (
                <Link
                  href="/dashboard"
                  className="
                  nav-link
                  text-[var(--gold-primary)]
                  smooth-transition
                  hover:opacity-80
                "
                >
                  الداشبورد
                </Link>
              )}
            </div>
          </div>

          {/* SOCIAL */}

          <div>
            <h3
              className="
              text-2xl
              mb-5
              sub-title
            "
            >
              تابعنا
            </h3>

            <div
              className="
              flex
              items-center
              gap-4
              flex-wrap
            "
            >
              <a
                href="https://www.facebook.com/share/1HNoBrQYkx/"
                target="_blank"
                rel="noopener noreferrer"
                className="
                glass-card
                p-4
                hover-lift
              "
              >
                <img
                  src="/images/facebook.png"
                  alt="facebook"
                  className="
                  w-7
                  h-7
                  object-contain
                "
                />
              </a>

              <a
                href="https://www.tiktok.com/@user45588142972968?_r=1&_t=ZS-96efQ2e0ujE"
                target="_blank"
                rel="noopener noreferrer"
                className="
                glass-card
                p-4
                hover-lift
              "
              >
                <img
                  src="/images/tiktok.png"
                  alt="tiktok"
                  className="
                  w-7
                  h-7
                  object-contain
                "
                />
              </a>

              <a
                href="https://wa.me/201065955112"
                target="_blank"
                rel="noopener noreferrer"
                className="
                glass-card
                p-4
                hover-lift
              "
              >
                <img
                  src="/images/whatsapp.png"
                  alt="whatsapp"
                  className="
                  w-7
                  h-7
                  object-contain
                "
                />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM */}

        <div
          className="
          border-t
          border-[var(--border-color)]
          pt-6
          flex
          flex-col
          md:flex-row
          items-center
          justify-between
          gap-5
          text-center
        "
        >
          <p
            className="
            text-[var(--text-secondary)]
            text-sm
          "
          >
            © 2026 منصة المبدع التعليمية — جميع الحقوق محفوظة
          </p>

          <a
            href="https://wa.me/201280522844"
            target="_blank"
            rel="noopener noreferrer"
            className="
            text-sm
            text-red-400
            sub-title
            smooth-transition
            hover:text-red-300
          "
          >
            Developed By Eng / Youssef Adel
          </a>
        </div>
      </div>
    </footer>
  );
}