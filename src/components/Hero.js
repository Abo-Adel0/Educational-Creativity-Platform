"use client";

import Link from "next/link";

export default function Hero() {

  return (

    <section
      className="
      section-space
      relative
      overflow-hidden
      min-h-screen
      flex
      items-center
    "
    >

      {/* BACKGROUND */}

      <div
        className="
        absolute
        inset-0
        overflow-hidden
      "
      >

        <div
          className="
          absolute
          top-[-120px]
          right-[-100px]
          w-[350px]
          h-[350px]
          rounded-full
          bg-yellow-400/20
          blur-[120px]
          hero-glow
        "
        />

        <div
          className="
          absolute
          bottom-[-100px]
          left-[-100px]
          w-[300px]
          h-[300px]
          rounded-full
          bg-blue-500/20
          blur-[120px]
          hero-glow
        "
        />

      </div>

      {/* CONTENT */}

      <div
        className="
        container-custom
        relative
        z-10
      "
      >

        <div
          className="
          flex
          flex-col
          items-center
          text-center
        "
        >

          {/* IMAGE */}

          <div
            className="
            glass-card
            p-4
            mb-8
            floating
          "
          >

            <img
              src="/images/teacher.png"
              alt="teacher"
              className="
              w-[280px]
              md:w-[360px]
              rounded-[28px]
              object-cover
            "
            />

          </div>

          {/* TITLE */}

          <h1
            className="
            text-5xl
            md:text-7xl
            leading-[1.5]
            mb-4
            main-title
            fade-up
          "
          >

            منصة المبدع التعليمية

          </h1>

          {/* SUBTITLE */}

          <p
            className="
            text-xl
            md:text-2xl
            text-[var(--gold-primary)]
            mb-8
            sub-title
          "
          >

            مع الأستاذ محمود بن وهبه الأزهري

          </p>

          {/* QUOTE */}

          <div
            className="
            glass-card
            max-w-4xl
            p-8
            fade-in
          "
          >

            <h2
              className="
              text-lg
              md:text-2xl
              leading-[2.3]
              text-[var(--text-secondary)]
            "
            >

              "لو انت بتدور على مكان تحس فيه بالراحة والأمان
              وتطمن فيه على مستقبلك ف انت في المكان الصح
              لأننا بنقدملك شرح مفصل لكل نقطة وقصص على كل
              جزئية في الدرس عشان متملش وربنا يوفقك يا بطل 💪🏻"

            </h2>

          </div>

          {/* BUTTONS */}

          <div
            className="
            hero-buttons
            flex
            items-center
            gap-5
            mt-10
          "
          >

            <Link
              href="/login"
              className="
              primary-btn
              hover-lift
            "
            >
              ابدأ الآن
            </Link>

            <Link
              href="/books"
              className="
              glass-card
              px-7
              py-4
              nav-link
              hover-lift
            "
            >
              تصفح الكتب
            </Link>

          </div>

        </div>

      </div>

    </section>

  );
}