"use client";

import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const SUPPORT_PHONE = "201065955112";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [form, setForm] = useState({
    studentName: "",
    studentPhone: "",
    alternativePhone: "",
    address: "",
    details: "",
  });

  useEffect(() => {
    let active = true;

    const fetchBooks = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/books", { cache: "no-store" });
        const data = await res.json();

        if (!active) return;
        setBooks(data.success ? data.books || [] : []);
      } catch {
        if (active) setBooks([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchBooks();

    return () => {
      active = false;
    };
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const openOrderForm = (book) => {
    setSelectedBook(book);
    setTimeout(() => {
      document.getElementById("book-order-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  };

  const sendBookOrder = (event) => {
    event.preventDefault();

    if (!selectedBook || !form.studentName || !form.studentPhone || !form.address) {
      return;
    }

    const message = `طلب كتاب من منصة المبدع\n\nالكتاب: ${selectedBook.title}\nالسعر: ${selectedBook.price} جنيه\nالصف: ${selectedBook.grade || "غير محدد"}\n\nاسم الطالب: ${form.studentName}\nرقم الطالب: ${form.studentPhone}\nرقم بديل: ${form.alternativePhone || "غير موجود"}\nالعنوان بالتفصيل: ${form.address}\nتفاصيل إضافية: ${form.details || "لا يوجد"}`;

    const whatsappUrl = `https://wa.me/${SUPPORT_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <section className="section-space">
        <div className="container-custom">
          <div className="glass-card p-7 md:p-12 text-center mb-10">
            <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-6">المكتبة التعليمية</h1>
            <p className="text-[var(--text-secondary)] text-lg md:text-xl leading-[2] max-w-3xl mx-auto">
              اختر الكتاب المناسب، واملأ بيانات الطلب ليتم التواصل مع الدعم الفني مباشرة.
            </p>
          </div>

          {loading ? (
            <div className="glass-card p-10 text-center">
              <h2 className="text-2xl main-title">جاري تحميل الكتب...</h2>
            </div>
          ) : books.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <img src="/images/empty.png" alt="لا يوجد محتوى" className="w-[190px] md:w-[230px] mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl main-title mb-4">لا توجد كتب متاحة حاليًا</h2>
              <p className="text-[var(--text-secondary)] leading-[2]">ستظهر الكتب والمذكرات هنا عند توفرها.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {books.map((book) => (
                <div key={book._id} className="glass-card p-6 hover-lift">
                  <div className="mb-6">
                    {book.image ? (
                      <img src={book.image} alt={book.title} className="w-full h-[300px] md:h-[340px] object-cover rounded-[28px]" />
                    ) : (
                      <div className="w-full h-[300px] md:h-[340px] rounded-[28px] glass-card flex items-center justify-center">
                        <span className="text-[var(--gold-primary)] sub-title">كتاب</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl md:text-3xl main-title mb-3">{book.title}</h2>

                  {book.grade && <p className="text-[var(--text-secondary)] mb-3">الصف: {book.grade}</p>}

                  <p className="text-[var(--gold-primary)] sub-title text-xl mb-4">السعر: {book.price} جنيه</p>

                  {book.description && <p className="text-[var(--text-secondary)] leading-[2] mb-6">{book.description}</p>}

                  <button onClick={() => openOrderForm(book)} className="primary-btn w-full">طلب الكتاب</button>
                </div>
              ))}
            </div>
          )}

          {selectedBook && (
            <form id="book-order-form" onSubmit={sendBookOrder} className="glass-card p-6 md:p-10 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-5xl main-title text-[var(--gold-primary)] mb-5 text-center">طلب الكتاب</h2>
              <p className="text-center text-[var(--text-secondary)] leading-[2] mb-8">
                الكتاب المختار: <span className="text-[var(--gold-primary)] font-bold">{selectedBook.title}</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input value={form.studentName} onChange={(e) => updateForm("studentName", e.target.value)} required placeholder="اسم الطالب" className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]" />
                <input value={form.studentPhone} onChange={(e) => updateForm("studentPhone", e.target.value)} required inputMode="numeric" placeholder="رقم الطالب" className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]" />
                <input value={form.alternativePhone} onChange={(e) => updateForm("alternativePhone", e.target.value)} inputMode="numeric" placeholder="رقم بديل" className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]" />
                <input value={form.address} onChange={(e) => updateForm("address", e.target.value)} required placeholder="العنوان بالتفصيل" className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]" />
                <textarea value={form.details} onChange={(e) => updateForm("details", e.target.value)} placeholder="تفاصيل إضافية" className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] min-h-[130px] md:col-span-2 resize-none" />
                <button className="primary-btn md:col-span-2">إرسال الطلب على واتساب</button>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
