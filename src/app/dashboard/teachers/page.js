"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "../../../components/ProtectedRoute";
import Toast from "../../../components/Toast";

export default function TeachersDashboardPage() {
  const [teachers, setTeachers] = useState([]);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

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

  const fetchTeachers = async () => {
    try {
      setFetchLoading(true);

      const res = await fetch("/api/teachers", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل جلب المدرسين", "error");
        return;
      }

      setTeachers(data.teachers || []);
    } catch (error) {
      showToast("حدث خطأ أثناء جلب المدرسين", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async () => {
    if (!name.trim() || !subject.trim()) {
      showToast("أدخل اسم المدرس والمادة", "error");
      return;
    }

    try {
      setLoading(true);

      let imageBase64 = "";

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          subject,
          description,
          image,
          imageBase64,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل إضافة المدرس", "error");
        return;
      }

      showToast("تم إضافة المدرس بنجاح", "success");

      setName("");
      setSubject("");
      setDescription("");
      setImage("");
      setImageFile(null);

      setTeachers([...teachers, data.teacher]);
    } catch (error) {
      showToast("حدث خطأ أثناء إضافة المدرس", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      const res = await fetch(`/api/teachers?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل حذف المدرس", "error");
        return;
      }

      showToast("تم حذف المدرس", "success");
      setTeachers(teachers.filter((t) => t._id !== id));
    } catch (error) {
      showToast("حدث خطأ أثناء حذف المدرس", "error");
    }
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
                    إدارة المدرسين
                  </h1>

                  <p className="text-[var(--text-secondary)] leading-[2]">
                    إضافة المدرسين وحفظ بياناتهم في MongoDB، ورفع الصور على Cloudinary.
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
                  إضافة مدرس جديد
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="اسم المدرس"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <input
                    type="text"
                    placeholder="المادة"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <input
                    type="text"
                    placeholder="رابط صورة المدرس اختياري"
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
                    placeholder="وصف المدرس"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] min-h-[140px] md:col-span-2 resize-none"
                  />

                  <button
                    onClick={handleAddTeacher}
                    disabled={loading}
                    className="primary-btn md:col-span-2"
                  >
                    {loading ? "جاري الإضافة..." : "إضافة المدرس"}
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  المدرسون المضافون
                </h2>

                {fetchLoading ? (
                  <div className="text-center py-12">
                    <h3 className="text-2xl main-title">
                      جاري تحميل المدرسين...
                    </h3>
                  </div>
                ) : teachers.length === 0 ? (
                  <div className="text-center py-12">
                    <img
                      src="/images/empty.png"
                      alt="empty"
                      className="w-[170px] mx-auto mb-6"
                    />

                    <h3 className="text-2xl main-title">
                      لم يتم إضافة أي مدرسين
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {teachers.map((teacher) => (
                      <div
                        key={teacher._id}
                        className="glass-card p-6"
                      >
                        <div className="mb-5">
                          {teacher.image ? (
                            <img
                              src={teacher.image}
                              alt={teacher.name}
                              className="w-full h-[220px] object-cover rounded-[24px]"
                            />
                          ) : (
                            <div className="w-full h-[220px] rounded-[24px] glass-card flex items-center justify-center text-6xl">
                              👨‍🏫
                            </div>
                          )}
                        </div>

                        <h3 className="text-2xl main-title mb-3">
                          {teacher.name}
                        </h3>

                        <p className="text-[var(--gold-primary)] sub-title mb-3">
                          {teacher.subject}
                        </p>

                        {teacher.description && (
                          <p className="text-[var(--text-secondary)] leading-[2] mb-5">
                            {teacher.description}
                          </p>
                        )}

                        <button
                          onClick={() =>
                            handleDeleteTeacher(teacher._id)
                          }
                          className="glass-card p-4 text-red-400 w-full"
                        >
                          حذف المدرس
                        </button>
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