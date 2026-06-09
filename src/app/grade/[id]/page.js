"use client";

import Navbar
from "../../../components/Navbar";

import Footer
from "../../../components/Footer";

import EmptyState
from "../../../components/EmptyState";

export default function GradePage() {

  /* TEMP COURSES */

  const courses = [];

  return (

    <main className="grade-page">

      {/* NAVBAR */}

      <Navbar />

      {/* HERO */}

      <section className="grade-hero">

        <div className="grade-overlay"></div>

        <div className="grade-content">

          <h1>

            السنة الدراسية

          </h1>

          <p>

            جميع الكورسات الخاصة
            بهذه السنة الدراسية

          </p>

        </div>

      </section>

      {/* COURSES */}

      <section className="grade-courses">

        {courses.length > 0 ? (

          <div className="courses-grid">

            {courses.map(
              (course) => (

                <div
                  key={course.id}
                  className="course-card"
                >

                  <img
                    src={
                      course.image ||
                      "/images/course.png"
                    }
                    alt={course.title}
                  />

                  <div className="course-info">

                    <h2>

                      {course.title}

                    </h2>

                    <p>

                      {
                        course.description
                      }

                    </p>

                    <h3>

                      {course.price}
                      جنيه

                    </h3>

                    <button>

                      عرض الكورس

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <EmptyState
            text="لم يتم تنزيل أي كورسات"
          />

        )}

      </section>

      {/* FOOTER */}

      <Footer />

    </main>

  );

}