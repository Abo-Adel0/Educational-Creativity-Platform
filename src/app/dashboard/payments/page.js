"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "../../../components/ProtectedRoute";
import Toast from "../../../components/Toast";

const methodName = {
  vodafone_cash: "Vodafone Cash",
  instapay: "InstaPay",
};

const statusName = {
  pending: "قيد المراجعة",
  paid: "مقبول",
  rejected: "مرفوض",
  expired: "منتهي",
};

export default function DashboardPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/payments", { cache: "no-store", credentials: "include" });
      const data = await res.json();
      setPayments(data.success ? data.payments || [] : []);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDecision = async (paymentId, decision) => {
    try {
      setWorkingId(paymentId);
      const res = await fetch(`/api/payments/${decision}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ paymentId }),
      });

      const data = await res.json();

      if (!data.success) {
        showToast(data.message || "فشل تنفيذ العملية", "error");
        return;
      }

      showToast(data.message, "success");
      fetchPayments();
    } catch {
      showToast("حدث خطأ أثناء تنفيذ العملية", "error");
    } finally {
      setWorkingId("");
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-8">
        <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />

        <section className="min-h-screen flex items-center justify-center">
          <div className="container-custom">
            <div className="glass-card p-6 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-10 text-center md:text-right">
                <div>
                  <h1 className="text-4xl md:text-6xl main-title text-[var(--gold-primary)] mb-4">طلبات الدفع</h1>
                  <p className="text-[var(--text-secondary)] leading-[2]">مراجعة مدفوعات Vodafone Cash وInstaPay وفتح الكورسات بعد التأكد.</p>
                </div>
                <Link href="/dashboard" className="primary-btn whitespace-nowrap">الرجوع للداشبورد</Link>
              </div>

              {loading ? (
                <div className="glass-card p-10 text-center"><h2 className="text-2xl main-title">جاري تحميل طلبات الدفع...</h2></div>
              ) : payments.length === 0 ? (
                <div className="glass-card p-10 text-center">
                  <img src="/images/empty.png" alt="empty" className="w-[170px] mx-auto mb-6" />
                  <h2 className="text-2xl main-title">لا توجد طلبات دفع حاليًا</h2>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {payments.map((payment) => (
                    <div key={payment._id} className="glass-card p-6">
                      <div className="flex flex-col gap-3 mb-6">
                        <h3 className="text-2xl main-title">{payment.course?.title || "كورس"}</h3>
                        <p className="text-[var(--text-secondary)]">الطالب: {payment.user?.studentPhone || "غير محدد"}</p>
                        <p className="text-[var(--text-secondary)]">طريقة الدفع: {methodName[payment.method] || payment.method}</p>
                        <p className="text-[var(--text-secondary)]">رقم المحول منه: {payment.senderPhone || "غير مسجل"}</p>
                        <p className="text-[var(--gold-primary)] sub-title">المبلغ: {payment.amount} جنيه</p>
                        <p className="text-[var(--text-secondary)]">الحالة: {statusName[payment.status] || payment.status}</p>
                        {payment.referenceCode && <p className="text-[var(--text-secondary)]">رقم العملية: {payment.referenceCode}</p>}
                        {payment.notes && <p className="text-[var(--text-secondary)]">ملاحظات: {payment.notes}</p>}
                      </div>

                      {payment.proofImage && (
                        <a href={payment.proofImage} target="_blank" rel="noopener noreferrer" className="glass-card p-4 block text-center text-[var(--gold-primary)] mb-4">عرض صورة الدفع</a>
                      )}

                      {payment.status === "pending" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button disabled={workingId === payment._id} onClick={() => handleDecision(payment._id, "approve")} className="primary-btn">قبول وفتح الكورس</button>
                          <button disabled={workingId === payment._id} onClick={() => handleDecision(payment._id, "reject")} className="glass-card p-4 text-red-400">رفض الطلب</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </ProtectedRoute>
  );
}
