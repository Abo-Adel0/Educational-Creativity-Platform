"use client";

import Link from "next/link";

export default function MobileMenu({
  menuOpen,
  setMenuOpen,
}) {

  return (

    <div
      className={`mobile-menu ${
        menuOpen
          ? "show-menu"
          : ""
      }`}
    >

      {/* CLOSE AREA */}

      <div
        className="mobile-menu-overlay"
        onClick={() =>
          setMenuOpen(false)
        }
      ></div>

      {/* MENU CONTENT */}

      <div className="mobile-menu-content">

        <button
          className="close-menu"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          ✕
        </button>

        <Link
          href="/"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          الرئيسية

        </Link>

        <Link
          href="/teachers"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          المدرسين

        </Link>

        <Link
          href="/books"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          الكتب

        </Link>

        <Link
          href="/login"
          onClick={() =>
            setMenuOpen(false)
          }
        >

          تسجيل الدخول

        </Link>

        <a
          href="https://www.facebook.com/share/1PeLc1MvgQ/"
          target="_blank"
        >

          تواصل معنا

        </a>

      </div>

    </div>

  );

}