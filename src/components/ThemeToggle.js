"use client";

import {
  useEffect,
  useState,
} from "react";

export default function ThemeToggle() {

  const [darkMode, setDarkMode] =
    useState(true);

  const [mounted, setMounted] =
    useState(false);

  /* =========================
     LOAD THEME
  ========================= */

  useEffect(() => {

    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme === "light") {

      document.body.classList.add(
        "light-mode"
      );

      setDarkMode(false);

    } else {

      document.body.classList.remove(
        "light-mode"
      );

      setDarkMode(true);
    }

    setMounted(true);

  }, []);

  /* =========================
     TOGGLE THEME
  ========================= */

  const toggleTheme = () => {

    if (darkMode) {

      document.body.classList.add(
        "light-mode"
      );

      localStorage.setItem(
        "theme",
        "light"
      );

    } else {

      document.body.classList.remove(
        "light-mode"
      );

      localStorage.setItem(
        "theme",
        "dark"
      );
    }

    setDarkMode(!darkMode);
  };

  if (!mounted) return null;

  return (

    <button
      onClick={toggleTheme}
      className="
      glass-card
      w-[55px]
      h-[55px]
      flex
      items-center
      justify-center
      text-2xl
      smooth-transition
      hover-lift
    "
    >

      <span
        className="
        smooth-transition
      "
      >
        {darkMode ? "🌙" : "☀️"}
      </span>

    </button>

  );
}