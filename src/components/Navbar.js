"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import ThemeToggle from "./ThemeToggle";

import {
  getCurrentUser,
  logoutUser,
} from "../utils/auth";

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3l7 3v5c0 4.5-2.8 8.5-7 10-4.2-1.5-7-5.5-7-10V6l7-3Z" />
    <path d="M9 12l2 2 4-5" />
  </svg>
);

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const currentUser = await getCurrentUser();

      if (!active) return;

      setUser(currentUser);
      setMounted(true);
    };

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  const canAccessDashboard =
    user?.role === "owner" ||
    user?.role === "admin";

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    closeMenu();
    router.push("/login");
  };

  return (
    <>
      <header className="w-full px-4 pt-5 pb-3 relative z-[50]">
        <nav className="max-w-[1200px] mx-auto glass-card px-5 py-4 flex items-center justify-between rounded-[28px]">
          <Link
            href="/"
            className="main-title text-2xl md:text-3xl text-[var(--gold-primary)] font-bold"
          >
            منصة المبدع
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="nav-link text-lg hover:text-[var(--gold-primary)] smooth-transition">
              الرئيسية
            </Link>

            <Link href="/teachers" className="nav-link text-lg hover:text-[var(--gold-primary)] smooth-transition">
              المدرسين
            </Link>

            <Link href="/books" className="nav-link text-lg hover:text-[var(--gold-primary)] smooth-transition">
              الكتب
            </Link>

            <a
              href="https://wa.me/201065955112"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link text-lg hover:text-[var(--gold-primary)] smooth-transition"
            >
              تواصل معنا
            </a>

            {canAccessDashboard && (
              <Link
                href="/dashboard"
                className="nav-link text-lg text-[var(--gold-primary)] hover:opacity-80 smooth-transition"
              >
                الداشبورد
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex glass-card px-5 py-3 text-red-400 sub-title hover-lift"
              >
                تسجيل الخروج
              </button>
            ) : (
              <Link href="/login" className="hidden md:inline-flex primary-btn">
                تسجيل الدخول
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden glass-card w-[56px] h-[56px] flex items-center justify-center rounded-[22px] hover-lift"
              aria-label="فتح القائمة"
            >
              <span className="flex flex-col gap-[6px]">
                <span className="w-8 h-[3px] rounded-full bg-[var(--text-primary)]" />
                <span className="w-8 h-[3px] rounded-full bg-[var(--text-primary)]" />
                <span className="w-8 h-[3px] rounded-full bg-[var(--text-primary)]" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        onClick={closeMenu}
        className={`
          fixed inset-0 bg-black/60 backdrop-blur-sm z-[998]
          transition-all duration-300
          ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      <aside
        className={`
          fixed top-0 right-0 h-screen w-[320px] max-w-[85%]
          z-[999] bg-[var(--bg-secondary)]
          border-l border-[var(--border-color)]
          p-6 overflow-y-auto transition-all duration-500
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="main-title text-3xl text-[var(--gold-primary)]">
            القائمة
          </h2>

          <button
            onClick={closeMenu}
            className="glass-card w-[52px] h-[52px] flex items-center justify-center text-2xl rounded-[20px]"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <Link href="/" onClick={closeMenu} className="glass-card p-5 flex items-center gap-4 text-xl hover-lift">
            <span className="sub-title">الرئيسية</span>
          </Link>

          <Link href="/teachers" onClick={closeMenu} className="glass-card p-5 flex items-center gap-4 text-xl hover-lift">
            <span className="sub-title">المدرسين</span>
          </Link>

          <Link href="/books" onClick={closeMenu} className="glass-card p-5 flex items-center gap-4 text-xl hover-lift">
            <span className="sub-title">الكتب</span>
          </Link>

          <a
            href="https://wa.me/201065955112"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-5 flex items-center gap-4 text-xl hover-lift"
          >
            <span className="sub-title">تواصل معنا</span>
          </a>

          {canAccessDashboard && (
            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="glass-card p-5 flex items-center gap-4 text-xl hover-lift border border-[var(--gold-primary)]"
            >
              <span className="text-[var(--gold-primary)]"><DashboardIcon /></span>
              <span className="sub-title text-[var(--gold-primary)]">الداشبورد</span>
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="glass-card p-5 flex items-center gap-4 text-xl text-red-400 hover-lift"
            >
              <span className="sub-title">تسجيل الخروج</span>
            </button>
          ) : (
            <Link href="/login" onClick={closeMenu} className="primary-btn text-center mt-2">
              تسجيل الدخول
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
