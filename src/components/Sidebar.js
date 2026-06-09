"use client";

import Link from "next/link";

export default function Sidebar({
  menuOpen,
  setMenuOpen,
}) {

  return (

    <>
      {/* OVERLAY */}

      <div
        onClick={() =>
          setMenuOpen(false)
        }
        className={`
          fixed
          inset-0
          bg-black/60
          backdrop-blur-sm
          z-40
          transition-all
          duration-300

          ${
            menuOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible"
          }
        `}
      />

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          top-0
          right-0
          h-screen
          w-[320px]
          max-w-[85%]
          z-50
          p-6
          bg-[var(--bg-secondary)]
          border-l
          border-[var(--border-color)]
          backdrop-blur-xl
          transition-all
          duration-500
          overflow-y-auto

          ${
            menuOpen
              ? "translate-x-0"
              : "translate-x-full"
          }
        `}
      >

        {/* TOP */}

        <div
          className="
          flex
          items-center
          justify-between
          mb-10
        "
        >

          <h2
            className="
            text-3xl
            main-title
            text-[var(--gold-primary)]
          "
          >
            القائمة
          </h2>

          <button
            onClick={() =>
              setMenuOpen(false)
            }
            className="
            glass-card
            w-[50px]
            h-[50px]
            flex
            items-center
            justify-center
            text-2xl
          "
          >
            ✕
          </button>

        </div>

        {/* LINKS */}

        <div
          className="
          flex
          flex-col
          gap-5
        "
        >

          {/* HOME */}

          <Link
            href="/"
            onClick={() =>
              setMenuOpen(false)
            }
            className="
            glass-card
            p-5
            flex
            items-center
            gap-4
            text-xl
            hover-lift
          "
          >

            <span className="text-3xl">
              🏠
            </span>

            <span className="sub-title">
              الرئيسية
            </span>

          </Link>

          {/* TEACHERS */}

          <Link
            href="/teachers"
            onClick={() =>
              setMenuOpen(false)
            }
            className="
            glass-card
            p-5
            flex
            items-center
            gap-4
            text-xl
            hover-lift
          "
          >

            <span className="text-3xl">
              👨‍🏫
            </span>

            <span className="sub-title">
              المدرسين
            </span>

          </Link>

          {/* BOOKS */}

          <Link
            href="/books"
            onClick={() =>
              setMenuOpen(false)
            }
            className="
            glass-card
            p-5
            flex
            items-center
            gap-4
            text-xl
            hover-lift
          "
          >

            <span className="text-3xl">
              📚
            </span>

            <span className="sub-title">
              الكتب
            </span>

          </Link>

          {/* CONTACT */}

          <a
            href="https://wa.me/201065955112"
            target="_blank"
            rel="noopener noreferrer"
            className="
            glass-card
            p-5
            flex
            items-center
            gap-4
            text-xl
            hover-lift
          "
          >

            <span className="text-3xl">
              📱
            </span>

            <span className="sub-title">
              تواصل معنا
            </span>

          </a>

          {/* LOGIN */}

          <Link
            href="/login"
            onClick={() =>
              setMenuOpen(false)
            }
            className="
            primary-btn
            text-center
            mt-3
          "
          >
            تسجيل الدخول
          </Link>

        </div>

      </aside>

    </>
  );
}