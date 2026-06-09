"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "../../../components/ProtectedRoute";
import Toast from "../../../components/Toast";

export default function BooksDashboardPage() {
  const [books, setBooks] = useState([]);

  const [title, setTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [pdf, setPdf] = useState("");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

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

  const fetchBooks = async () => {
    try {
      setFetchLoading(true);

      const res = await fetch("/api/books", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل جلب الكتب", "error");
        setBooks([]);
        return;
      }

      setBooks(data.books || []);
    } catch (error) {
      showToast("حدث خطأ أثناء جلب الكتب", "error");
      setBooks([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const resetForm = () => {
    setTitle("");
    setGrade("");
    setPrice("");
    setImage("");
    setPdf("");
    setDescription("");
    setIsFeatured(false);
    setImageFile(null);
    setPdfFile(null);
  };

  const handleAddBook = async () => {
    if (!title.trim() || !price.trim()) {
      showToast("أدخل اسم الكتاب والسعر", "error");
      return;
    }

    try {
      setLoading(true);

      let imageBase64 = "";
      let pdfBase64 = "";

      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      if (pdfFile) {
        pdfBase64 = await fileToBase64(pdfFile);
      }

      const res = await fetch("/api/books", {
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
          pdf,
          pdfBase64,
          description,
          isFeatured,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل إضافة الكتاب", "error");
        return;
      }

      showToast("تم إضافة الكتاب بنجاح", "success");

      resetForm();
      setBooks([...books, data.book]);
    } catch (error) {
      showToast("حدث خطأ أثناء إضافة الكتاب", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      const res = await fetch(`/api/books?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل حذف الكتاب", "error");
        return;
      }

      showToast("تم حذف الكتاب", "success");
      setBooks(books.filter((b) => b._id !== id));
    } catch (error) {
      showToast("حدث خطأ أثناء حذف الكتاب", "error");
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
              {/* TOP */}

              <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-10 text-center md:text-right">
                <div>
                  <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-4">
                    إدارة الكتب
                  </h1>

                  <p className="text-[var(--text-secondary)] leading-[2] max-w-3xl">
                    إضافة الكتب والمذكرات التعليمية وحفظها في MongoDB، مع رفع الصور وملفات PDF على Cloudinary.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="primary-btn whitespace-nowrap"
                >
                  الرجوع للداشبورد
                </Link>
              </div>

              {/* FORM */}

              <div className="glass-card p-6 md:p-8 mb-10">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  إضافة كتاب جديد
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="اسم الكتاب"
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
                      اختر الصف الدراسي اختياري
                    </option>

                    <option value="الصف الأول الإعدادي">
                      الصف الأول الإعدادي
                    </option>

                    <option value="الصف الثاني الإعدادي">
                      الصف الثاني الإعدادي
                    </option>

                    <option value="الصف الثالث الإعدادي">
                      الصف الثالث الإعدادي
                    </option>

                    <option value="الصف الأول الثانوي">
                      الصف الأول الثانوي
                    </option>

                    <option value="الصف الثاني الثانوي">
                      الصف الثاني الثانوي
                    </option>

                    <option value="الصف الثالث الثانوي">
                      الصف الثالث الثانوي
                    </option>
                  </select>

                  <input
                    type="number"
                    placeholder="سعر الكتاب"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <input
                    type="text"
                    placeholder="رابط صورة الكتاب اختياري"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <div className="glass-card p-4 md:col-span-2">
                    <label className="block mb-3 sub-title text-[var(--text-secondary)]">
                      أو ارفع صورة الكتاب من الجهاز
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

                  <input
                    type="text"
                    placeholder="رابط ملف PDF اختياري"
                    value={pdf}
                    onChange={(e) => setPdf(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] md:col-span-2"
                  />

                  <div className="glass-card p-4 md:col-span-2">
                    <label className="block mb-3 sub-title text-[var(--text-secondary)]">
                      أو ارفع ملف PDF من الجهاز
                    </label>

                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setPdfFile(e.target.files?.[0] || null)
                      }
                      className="w-full text-[var(--text-secondary)]"
                    />
                  </div>

                  <textarea
                    placeholder="وصف الكتاب"
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
                      جعل الكتاب مميزًا
                    </span>
                  </label>

                  <button
                    onClick={handleAddBook}
                    disabled={loading}
                    className="primary-btn md:col-span-2"
                  >
                    {loading ? "جاري الإضافة..." : "إضافة الكتاب"}
                  </button>
                </div>
              </div>

              {/* LIST */}

              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  الكتب المضافة
                </h2>

                {fetchLoading ? (
                  <div className="text-center py-12">
                    <h3 className="text-2xl main-title">
                      جاري تحميل الكتب...
                    </h3>
                  </div>
                ) : books.length === 0 ? (
                  <div className="text-center py-12">
                    <img
                      src="/images/empty.png"
                      alt="empty"
                      className="w-[170px] mx-auto mb-6"
                    />

                    <h3 className="text-2xl main-title">
                      لا يوجد أي محتوى
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {books.map((book) => (
                      <div
                        key={book._id}
                        className="glass-card p-6"
                      >
                        <div className="mb-5">
                          {book.image ? (
                            <img
                              src={book.image}
                              alt={book.title}
                              className="w-full h-[220px] object-cover rounded-[24px]"
                            />
                          ) : (
                            <div className="w-full h-[220px] rounded-[24px] glass-card flex items-center justify-center text-6xl">
                              📖
                            </div>
                          )}
                        </div>

                        <h3 className="text-2xl main-title mb-3">
                          {book.title}
                        </h3>

                        <p className="text-[var(--gold-primary)] sub-title mb-3">
                          السعر: {book.price} جنيه
                        </p>

                        {book.grade && (
                          <p className="text-[var(--text-secondary)] mb-3">
                            الصف: {book.grade}
                          </p>
                        )}

                        {book.description && (
                          <p className="text-[var(--text-secondary)] leading-[2] mb-5">
                            {book.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                          {book.pdf && (
                            <a
                              href={book.pdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="primary-btn text-center"
                            >
                              فتح ملف PDF
                            </a>
                          )}

                          <button
                            onClick={() =>
                              handleDeleteBook(book._id)
                            }
                            className="glass-card p-4 text-red-400 w-full"
                          >
                            حذف الكتاب
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