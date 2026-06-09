"use client";

import Link from "next/link";

export default function CourseCard({
  course,
}) {

  return (

    <Link
      href={`/courses/${course.id}`}
      className="course-card"
    >

      {/* IMAGE */}

      <div className="course-image-box">

        <img
          src={
            course.image ||
            "/images/empty.png"
          }
          alt={course.title}
          className="course-image"
        />

      </div>

      {/* CONTENT */}

      <div className="course-content">

        <h2 className="course-title">

          {course.title}

        </h2>

        <p className="course-description">

          {course.description}

        </p>

        {/* PRICE */}

        <div className="course-price-box">

          <span>

            السعر

          </span>

          <h3>

            {course.price}
            جنيه

          </h3>

        </div>

      </div>

      {/* GLOW */}

      <div className="course-glow"></div>

    </Link>

  );

}