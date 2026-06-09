"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Toast from "../../../components/Toast";
import { getCurrentUser } from "../../../utils/auth";

const SUPPORT_NUMBER = "01065955112";

export default function CoursePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId;

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [method, setMethod] = useState("vodafone_cash");
  const [senderPhone, setSenderPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [notes, setNotes] = useState("");
  const [proofImageBase64, setProofImageBase64] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);

        const currentUser = await getCurrentUser();

        if (!active) return;

        if (!currentUser) {
          router.replace(`/login?redirect=/payment/${courseId}`);
          return;
        }

        setUser(currentUser);

        const res = await fetch(`/api/courses/${courseId}`, { cache: "no-store" });
        const data = await res.json();

        if (!active) return;

        if (data.success) {
          setCourse(data.course);
          setAmount(String(data.course.price || ""));
        }
      } catch {
        setCourse(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [courseId, router]);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setProofImageBase64("");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setProofImageBase64(base64);
    } catch {
      showToast("تعذر قراءة صورة الدفع", "error");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!senderPhone.trim() || !amount) {
      showToast("أدخل رقم الهاتف المحول منه والمبلغ", "error");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courseId,
          method,
          senderPhone,
          amount,
          referenceCode,
          proofImageBase64,
          notes,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل إرسال طلب الدفع", "error");
        return;
      }

      showToast(data.message, "success");

      setTimeout(() => {
        router.push(`/courses/${courseId}`);
      }, 1300);
    } catch {
      showToast("حدث خطأ أثناء إرسال طلب الدفع", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <section className="section-space">
        <div className="container-custom">
          {loading ? (
            <div className="glass-card p-10 text-center">
              <h1 className="text-3xl main-title">جاري تحميل بيانات الدفع...</h1>
            </div>
          ) : !course ? (
            <div className="glass-card p-10 text-center">
              <h1 className="text-3xl main-title mb-5">الكورس غير موجود</h1>
              <Link href="/" className="primary-btn inline-block">الرجوع للرئيسية</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
              <form onSubmit={handleSubmit} className="glass-card p-6 md:p-10">
                <h1 className="text-4xl md:text-5xl main-title text-[var(--gold-primary)] mb-5">
                  تأكيد الدفع
                </h1>

                <p className="text-[var(--text-secondary)] leading-[2] mb-8">
                  بعد التحويل على رقم الدعم، املأ بيانات العملية وسيتم فتح الكورس بعد مراجعة الإدارة.
                </p>

                <div className="glass-card p-5 mb-6">
                  <p className="text-[var(--text-secondary)] mb-2">رقم الدفع Vodafone Cash / InstaPay</p>
                  <h2 className="text-3xl main-title text-[var(--gold-primary)]">{SUPPORT_NUMBER}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full glass-card p-4 bg-[var(--bg-secondary)] outline-none text-[var(--text-primary)]"
                  >
                    <option value="vodafone_cash">Vodafone Cash</option>
                    <option value="instapay">InstaPay</option>
                  </select>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="رقم الهاتف المحول منه"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <input
                    type="number"
                    placeholder="المبلغ المحول"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <input
                    type="text"
                    placeholder="رقم العملية / آخر 4 أرقام اختياري"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <div className="glass-card p-4 md:col-span-2">
                    <label className="block mb-3 text-[var(--text-secondary)]">
                      صورة إيصال الدفع / لقطة العملية
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-[var(--text-secondary)]"
                    />
                  </div>

                  <textarea
                    placeholder="ملاحظات إضافية اختياري"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)] min-h-[120px] md:col-span-2 resize-none"
                  />

                  <button disabled={submitting} className="primary-btn md:col-span-2">
                    {submitting ? "جاري الإرسال..." : "إرسال طلب الدفع"}
                  </button>
                </div>
              </form>

              <aside className="glass-card p-6 md:p-8">
                {course.image && (
                  <img src={course.image} alt={course.title} className="w-full h-[260px] object-cover rounded-[28px] mb-6" />
                )}

                <h2 className="text-3xl main-title text-[var(--gold-primary)] mb-4">
                  {course.title}
                </h2>

                <p className="text-[var(--text-secondary)] mb-4">
                  حساب الطالب: {user?.studentPhone}
                </p>

                <p className="text-2xl sub-title text-[var(--gold-primary)]">
                  المطلوب: {course.price} جنيه
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
