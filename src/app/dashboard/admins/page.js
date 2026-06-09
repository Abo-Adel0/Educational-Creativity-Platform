"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "../../../components/ProtectedRoute";
import Toast from "../../../components/Toast";

import {
  getUsers,
  addAdmin,
  removeAdmin,
} from "../../../utils/auth";

export default function AdminsPage() {
  const [users, setUsers] = useState([]);
  const [adminPhone, setAdminPhone] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const loadUsers = async () => {
    const loadedUsers = await getUsers();
    setUsers(loadedUsers);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  const admins = users.filter(
    (user) => user.role === "admin"
  );

  const handleAddAdmin = async () => {
    if (!adminPhone.trim()) {
      showToast("أدخل رقم الموبايل", "error");
      return;
    }

    const result = await addAdmin(adminPhone);

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    showToast(result.message, "success");
    setAdminPhone("");
    await loadUsers();
  };

  const handleRemoveAdmin = async (phone) => {
    const result = await removeAdmin(phone);

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    showToast(result.message, "success");
    await loadUsers();
  };

  return (
    <ProtectedRoute requireOwner>
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
                    إدارة الأدمنز
                  </h1>

                  <p className="text-[var(--text-secondary)] leading-[2]">
                    إضافة أو إزالة الأدمنز من المنصة. هذه الصفحة متاحة للمالك فقط.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="primary-btn whitespace-nowrap"
                >
                  الرجوع للداشبورد
                </Link>
              </div>

              {/* ADD ADMIN */}

              <div className="glass-card p-6 md:p-8 mb-10">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  إضافة أدمن جديد
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="رقم موبايل الأدمن"
                    value={adminPhone}
                    onChange={(e) =>
                      setAdminPhone(e.target.value)
                    }
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <button
                    onClick={handleAddAdmin}
                    className="primary-btn"
                  >
                    إضافة أدمن
                  </button>
                </div>

                <p className="text-[var(--text-secondary)] leading-[2] mt-5">
                  لو الرقم عنده حساب بالفعل سيتم تحويله لأدمن، ولو مش موجود سيتم إنشاء حساب أدمن مؤقت له.
                </p>
              </div>

              {/* ADMINS LIST */}

              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  قائمة الأدمنز
                </h2>

                {admins.length === 0 ? (
                  <div className="text-center py-12">
                    <img
                      src="/images/empty.png"
                      alt="empty"
                      className="w-[170px] mx-auto mb-6"
                    />

                    <h3 className="text-2xl main-title">
                      لا يوجد أدمنز مضافين
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="glass-card p-6"
                      >
                        <h3 className="text-2xl main-title mb-3">
                          {admin.studentPhone}
                        </h3>

                        <p className="text-[var(--text-secondary)] mb-5">
                          أدمن في المنصة
                        </p>

                        <button
                          onClick={() =>
                            handleRemoveAdmin(
                              admin.studentPhone
                            )
                          }
                          className="glass-card p-4 text-red-400 w-full"
                        >
                          إزالة الأدمن
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