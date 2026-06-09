"use client";

import Link from "next/link";

export default function GradeCard({
  grade,
  title,
  description,
  image,
  href,
}) {
  const finalTitle =
    title || grade?.title || "الصف الدراسي";

  const finalDescription =
    description || grade?.description || "";

  const finalImage =
    image || grade?.image || null;

  const finalHref =
    href || grade?.href || "/login";

  return (
    <Link
      href={finalHref}
      className="
      glass-card
      hover-lift
      overflow-hidden
      block
      group
      relative
      p-6
      text-center
      min-h-[150px]
      flex
      flex-col
      items-center
      justify-center
      gap-4
    "
    >
      {finalImage && (
        <div className="w-full overflow-hidden rounded-[22px] mb-3">
          <img
            src={finalImage}
            alt={finalTitle}
            className="
            w-full
            h-[180px]
            object-cover
            smooth-transition
            group-hover:scale-105
            "
          />
        </div>
      )}

      <h3
        className="
        text-2xl
        md:text-3xl
        main-title
        text-[var(--text-primary)]
      "
      >
        {finalTitle}
      </h3>

      {finalDescription && (
        <p
          className="
          text-[var(--text-secondary)]
          leading-[2]
          text-base
        "
        >
          {finalDescription}
        </p>
      )}

      <span
        className="
        text-[var(--gold-primary)]
        nav-link
        text-lg
        mt-2
      "
      >
        الدخول للقسم
      </span>
    </Link>
  );
}