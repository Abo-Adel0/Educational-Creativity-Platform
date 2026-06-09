"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Toast from "../../components/Toast";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../../utils/auth";

export default function LoginPage() {
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);

  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

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

  const getRedirectPath = () => {
    if (typeof window === "undefined") {
      return "";
    }

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");

    if (
      redirect &&
      redirect.startsWith("/") &&
      !redirect.startsWith("//")
    ) {
      return redirect;
    }

    return "";
  };

  const goAfterAuth = (user) => {
    const redirect = getRedirectPath();

    if (redirect) {
      router.push(redirect);
      return;
    }

    if (user.role === "owner" || user.role === "admin") {
      router.push("/dashboard");
      return;
    }

    router.push("/");
  };

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      const currentUser = await getCurrentUser();

      if (!active || !currentUser) return;

      goAfterAuth(currentUser);
    };

    checkUser();

    return () => {
      active = false;
    };
  }, []);

  const clearForm = () => {
    setStudentPhone("");
    setParentPhone("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    const result = await loginUser({
      phone: studentPhone,
      password,
    });

    setLoading(false);

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    showToast(result.message, "success");

    setTimeout(() => {
      goAfterAuth(result.user);
    }, 800);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);

    const result = await registerUser({
      studentPhone,
      parentPhone,
      password,
      confirmPassword,
    });

    setLoading(false);

    if (!result.success) {
      showToast(result.message, "error");
      return;
    }

    showToast(result.message, "success");
    clearForm();

    setTimeout(() => {
      goAfterAuth(result.user);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      <Navbar />

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

      <section className="section-space">
        <div className="container-custom">
          <div className="max-w-[560px] mx-auto glass-card p-7 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl main-title text-[var(--gold-primary)] mb-4">
                {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
              </h1>

              <p className="text-[var(--text-secondary)] leading-[2]">
                {isLogin
                  ? "ادخل رقم الطالب وكلمة السر للوصول إلى حسابك"
                  : "أنشئ حسابك للوصول إلى محتوى المنصة"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  clearForm();
                }}
                className={
                  isLogin
                    ? "primary-btn"
                    : "glass-card p-4 sub-title"
                }
              >
                تسجيل الدخول
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  clearForm();
                }}
                className={
                  !isLogin
                    ? "primary-btn"
                    : "glass-card p-4 sub-title"
                }
              >
                إنشاء حساب
              </button>
            </div>

            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="flex flex-col gap-5"
            >
              <input
                type="text"
                inputMode="numeric"
                placeholder="رقم الطالب"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
              />

              {!isLogin && (
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="رقم ولي الأمر"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                />
              )}

              <input
                type="password"
                placeholder="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
              />

              {!isLogin && (
                <input
                  type="password"
                  placeholder="تأكيد كلمة السر"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full glass-card p-4 bg-transparent outline-none text-[var(--text-primary)]"
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="primary-btn mt-3"
              >
                {loading
                  ? "جاري المعالجة..."
                  : isLogin
                  ? "تسجيل الدخول"
                  : "إنشاء الحساب"}
              </button>
            </form>

            <p className="text-center mt-8 text-[var(--text-secondary)]">
              {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  clearForm();
                }}
                className="mx-2 text-[var(--gold-primary)] font-bold"
              >
                {isLogin ? "إنشاء حساب" : "تسجيل الدخول"}
              </button>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
