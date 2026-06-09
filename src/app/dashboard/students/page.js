"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import ProtectedRoute from "../../../components/ProtectedRoute";
import Toast from "../../../components/Toast";

import {
  getUsers,
  changePassword,
  toggleBlockUser,
  deleteUser,
} from "../../../utils/auth";

export default function StudentsPage() {
  const [users, setUsers] = useState([]);

  const [studentPhone, setStudentPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const students = users.filter(
    (user) => user.role === "student"
  );

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => !student.blocked
  ).length;

  const blockedStudents = students.filter(
    (student) => student.blocked
  ).length;

  const studentsWithCourses = students.filter(
    (student) =>
      Array.isArray(student.paidCourses) &&
      student.paidCourses.length > 0
  ).length;

  const studentsWithoutCourses =
    totalStudents - studentsWithCourses;

  const parentsCount = students.filter(
    (student) => student.parentPhone
  ).length;

  const newAccounts = students.filter((student) => {
    if (!student.createdAt) return false;

    const createdDate = new Date(student.createdAt);
    const now = new Date();

    const diffDays =
      (now - createdDate) / (1000 * 60 * 60 * 24);

    return diffDays <= 7;
  }).length;

  const handleChangePassword = async () => {
    if (
      !studentPhone.trim() ||
      !newPassword ||
      !confirmPassword
    ) {
      showToast("أدخل جميع البيانات", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("كلمتا السر غير متطابقتين", "error");
      return;
    }

    const result = await changePassword(
      studentPhone,
      newPassword
    );

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    showToast(result.message, "success");

    setStudentPhone("");
    setNewPassword("");
    setConfirmPassword("");

    await loadUsers();
  };

  const handleToggleBlock = async (phone) => {
    const result = await toggleBlockUser(phone);

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    showToast(result.message, "success");
    await loadUsers();
  };

  const handleDeleteUser = async (phone) => {
    const result = await deleteUser(phone);

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    showToast(result.message, "success");
    await loadUsers();
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
                    إدارة الطلاب
                  </h1>

                  <p className="text-[var(--text-secondary)] leading-[2]">
                    متابعة الطلاب وتغيير كلمات المرور والحظر وفك الحظر وإدارة بياناتهم.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="primary-btn whitespace-nowrap"
                >
                  الرجوع للداشبورد
                </Link>
              </div>

              {/* STATS */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                    {totalStudents}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    عدد الطلاب الكلي
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                    {activeStudents}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    طلاب نشطين
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-red-400 mb-2">
                    {blockedStudents}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    طلاب محظورين
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                    {parentsCount}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    أولياء أمور
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                    {studentsWithCourses}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    لديهم كورسات مفتوحة
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                    {studentsWithoutCourses}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    بدون اشتراكات
                  </p>
                </div>

                <div className="glass-card p-6 text-center">
                  <h2 className="text-4xl main-title text-[var(--gold-primary)] mb-2">
                    {newAccounts}
                  </h2>
                  <p className="text-[var(--text-secondary)]">
                    حسابات جديدة
                  </p>
                </div>
              </div>

              {/* CHANGE PASSWORD */}

              <div className="glass-card p-6 md:p-8 mb-10">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  تغيير كلمة سر طالب
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="رقم الطالب"
                    value={studentPhone}
                    onChange={(e) =>
                      setStudentPhone(e.target.value)
                    }
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <input
                    type="password"
                    placeholder="كلمة السر الجديدة"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <input
                    type="password"
                    placeholder="تأكيد كلمة السر الجديدة"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                  />

                  <button
                    onClick={handleChangePassword}
                    className="primary-btn"
                  >
                    تغيير كلمة السر
                  </button>
                </div>
              </div>

              {/* STUDENTS LIST */}

              <div className="glass-card p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl main-title mb-6">
                  قائمة الطلاب
                </h2>

                {students.length === 0 ? (
                  <div className="text-center py-12">
                    <img
                      src="/images/empty.png"
                      alt="empty"
                      className="w-[170px] mx-auto mb-6"
                    />

                    <h3 className="text-2xl main-title">
                      لا يوجد طلاب حتى الآن
                    </h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="glass-card p-6"
                      >
                        <div className="flex flex-col gap-3 mb-6">
                          <h3 className="text-2xl main-title">
                            {student.studentPhone}
                          </h3>

                          <p className="text-[var(--text-secondary)]">
                            رقم ولي الأمر:{" "}
                            {student.parentPhone || "غير موجود"}
                          </p>

                          <p className="text-[var(--text-secondary)]">
                            الحالة:{" "}
                            <span
                              className={
                                student.blocked
                                  ? "text-red-400"
                                  : "text-green-400"
                              }
                            >
                              {student.blocked
                                ? "محظور"
                                : "نشط"}
                            </span>
                          </p>

                          <p className="text-[var(--text-secondary)]">
                            الكورسات المفتوحة:{" "}
                            {Array.isArray(student.paidCourses)
                              ? student.paidCourses.length
                              : 0}
                          </p>

                          <p className="text-[var(--text-secondary)]">
                            تاريخ الإنشاء:{" "}
                            {student.createdAt
                              ? new Date(
                                  student.createdAt
                                ).toLocaleDateString("ar-EG")
                              : "غير محدد"}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            onClick={() =>
                              handleToggleBlock(
                                student.studentPhone
                              )
                            }
                            className={
                              student.blocked
                                ? "glass-card p-4 text-green-400"
                                : "glass-card p-4 text-red-400"
                            }
                          >
                            {student.blocked
                              ? "فك الحظر"
                              : "حظر الطالب"}
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteUser(
                                student.studentPhone
                              )
                            }
                            className="glass-card p-4 text-red-400"
                          >
                            حذف الطالب
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