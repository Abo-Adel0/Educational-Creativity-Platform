"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "../../../components/ProtectedRoute";
import Toast from "../../../components/Toast";

export default function CoursesDashboardPage() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  };

  const fetchCourses = async () => {
    try {
      setFetchLoading(true);

      const res = await fetch("/api/courses", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل جلب الكورسات", "error");
        return;
      }

      setCourses(data.courses || []);
    } catch (error) {
      showToast("حدث خطأ أثناء جلب الكورسات", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.success) {
        setTeachers(data.teachers || []);
      }
    } catch (error) {
      setTeachers([]);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchCourses();
  }, []);

  const handleAddCourse = async () => {
    if (!title.trim() || !grade.trim()) {
      showToast("أدخل اسم الكورس والصف الدراسي", "error");
      return;
    }

    try {
      setLoading(true);

      let imageBase64 = "";

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          grade,
          price,
          image,
          imageBase64,
          description,
          teacherId,
          isFeatured,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل إضافة الكورس", "error");
        return;
      }

      showToast("تم إضافة الكورس بنجاح", "success");

      setTitle("");
      setGrade("");
      setPrice("");
      setImage("");
      setImageFile(null);
      setDescription("");
      setTeacherId("");
      setIsFeatured(false);

      setCourses([...courses, data.course]);
    } catch (error) {
      showToast("حدث خطأ أثناء إضافة الكورس", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل حذف الكورس", "error");
        return;
      }

      showToast("تم حذف الكورس", "success");
      setCourses(courses.filter((c) => c._id !== id));
    } catch (error) {
      showToast("حدث خطأ أثناء حذف الكورس", "error");
    }
  };

  const getGradeName = (gradeValue) => {
    const grades = {
      "first-prep": "الصف الأول الإعدادي",
      "second-prep": "الصف الثاني الإعدادي",
      "third-prep": "الصف الثالث الإعدادي",
      "first-secondary": "الصف الأول الثانوي",
      "second-secondary": "الصف الثاني الثانوي",
      "third-secondary": "الصف الثالث الثانوي",
    };

    return grades[gradeValue] || gradeValue;
  };

  return (
    <ProtectedRoute requireAdmin>
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-8">
        <Toast
          show={toast.show}
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({
              ...toast,
              show: false,
            })
          }
        />

        <section className="min-h-screen flex items-center justify-center">
          <div className="container-custom">
            <div className="glass-card p-6 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-10 text-center md:text-right">
                <div>
                  <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-4">
                    إدارة الكورسات
                  </h1>

                  <p className="text-[var(--text-secondary)] leading-[2]">
                    إضافة الكورسات وحفظها في MongoDB وربط الصور بـ Cloudinary.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="primary-btn whitespace-nowrap"
                >
                  الرجوع للداشبورد
                </Link>
              </div>

              <div className="glass-card p-6 md:p-8 mb-10">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  إضافة كورس جديد
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="اسم الكورس"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full glass-card p-4 bg-[var(--bg-secondary)] outline-none text-[var(--text-primary)]"
                  >
                    <option value="">
                      اختر الصف الدراسي
                    </option>

                    <option value="first-prep">
                      الصف الأول الإعدادي
                    </option>

                    <option value="second-prep">
                      الصف الثاني الإعدادي
                    </option>

                    <option value="third-prep">
                      الصف الثالث الإعدادي
                    </option>

                    <option value="first-secondary">
                      الصف الأول الثانوي
                    </option>

                    <option value="second-secondary">
                      الصف الثاني الثانوي
                    </option>

                    <option value="third-secondary">
                      الصف الثالث الثانوي
                    </option>
                  </select>

                  <input
                    type="number"
                    placeholder="سعر الكورس"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <select
                    value={teacherId}
                    onChange={(e) => setTeacherId(e.target.value)}
                    className="w-full glass-card p-4 bg-[var(--bg-secondary)] outline-none text-[var(--text-primary)]"
                  >
                    <option value="">
                      اختر المدرس اختياري
                    </option>

                    {teachers.map((teacher) => (
                      <option
                        key={teacher._id}
                        value={teacher._id}
                      >
                        {teacher.name} - {teacher.subject}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="رابط صورة الكورس اختياري"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] md:col-span-2"
                  />

                  <div className="glass-card p-4 md:col-span-2">
                    <label className="block mb-3 sub-title text-[var(--text-secondary)]">
                      أو ارفع صورة من الجهاز
                    </label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                      className="w-full text-[var(--text-secondary)]"
                    />
                  </div>

                  <textarea
                    placeholder="وصف الكورس"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] min-h-[140px] md:col-span-2 resize-none"
                  />

                  <label className="glass-card p-4 md:col-span-2 flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) =>
                        setIsFeatured(e.target.checked)
                      }
                    />

                    <span className="sub-title">
                      جعل الكورس مميزًا في الصفحة الرئيسية
                    </span>
                  </label>

                  <button
                    onClick={handleAddCourse}
                    disabled={loading}
                    className="primary-btn md:col-span-2"
                  >
                    {loading ? "جاري الإضافة..." : "إضافة الكورس"}
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  الكورسات المضافة
                </h2>

                {fetchLoading ? (
                  <div className="text-center py-12">
                    <h3 className="text-2xl main-title">
                      جاري تحميل الكورسات...
                    </h3>
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center py-12">
                    <img
                      src="/images/empty.png"
                      alt="empty"
                      className="w-[170px] mx-auto mb-6"
                    />

                    <h3 className="text-2xl main-title">
                      لم يتم إضافة أي كورسات
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {courses.map((course) => (
                      <div
                        key={course._id}
                        className="glass-card p-6"
                      >
                        <div className="mb-5">
                          {course.image ? (
                            <img
                              src={course.image}
                              alt={course.title}
                              className="w-full h-[220px] object-cover rounded-[24px]"
                            />
                          ) : (
                            <div className="w-full h-[220px] rounded-[24px] glass-card flex items-center justify-center text-6xl">
                              📚
                            </div>
                          )}
                        </div>

                        <h3 className="text-2xl main-title mb-3">
                          {course.title}
                        </h3>

                        <p className="text-[var(--gold-primary)] sub-title mb-3">
                          السعر: {course.price} جنيه
                        </p>

                        <p className="text-[var(--text-secondary)] mb-3">
                          الصف: {getGradeName(course.grade)}
                        </p>

                        {course.teacher && (
                          <p className="text-[var(--text-secondary)] mb-3">
                            المدرس: {course.teacher.name}
                          </p>
                        )}

                        {course.description && (
                          <p className="text-[var(--text-secondary)] leading-[2] mb-5">
                            {course.description}
                          </p>
                        )}

                        <div className="grid grid-cols-3 gap-3 mb-5">
                          <div className="glass-card p-3 text-center">
                            🎥 {course.videosCount || 0}
                          </div>

                          <div className="glass-card p-3 text-center">
                            📄 {course.filesCount || 0}
                          </div>

                          <div className="glass-card p-3 text-center">
                            📝 {course.examsCount || 0}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <Link
                            href={`/dashboard/courses/${course._id}`}
                            className="primary-btn text-center"
                          >
                            إدارة المحاضرات
                          </Link>

                          <button
                            onClick={() =>
                              handleDeleteCourse(course._id)
                            }
                            className="glass-card p-4 text-red-400 w-full"
                          >
                            حذف الكورس
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}