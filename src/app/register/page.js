"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "../../components/Toast";
import { registerUser } from "../../utils/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [studentPhone, setStudentPhone] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toast, setToast] =
    useState({

      show: false,

      message: "",

      type: "success",

    });

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !studentPhone ||
      !parentPhone ||
      !password ||
      !confirmPassword
    ) {
      setToast({
        show: true,
        message: "يرجى إدخال جميع البيانات",
        type: "error",
      });

      return;
    }

    if (password !== confirmPassword) {
      setToast({
        show: true,
        message: "كلمتا السر غير متطابقتين",
        type: "error",
      });

      return;
    }

    const result = await registerUser({
      studentPhone,
      parentPhone,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setToast({
        show: true,
        message: result.message,
        type: "error",
      });
      return;
    }

    setToast({
      show: true,
      message: result.message,
      type: "success",
    });

    setTimeout(() => {
      router.push("/login");
    }, 1200);
  };

  return (

    <main className="register-page">

      {/* TOAST */}

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

      {/* REGISTER BOX */}

      <div className="register-box">

        {/* TITLE */}

        <h1>

          إنشاء حساب

        </h1>

        <p>

          أنشئ حسابك للوصول
          إلى الكورسات والكتب

        </p>

        {/* FORM */}

        <form
          onSubmit={
            handleRegister
          }
          className="register-form"
        >

          {/* STUDENT PHONE */}

          <input
            type="text"
            placeholder="رقم الطالب"
            value={studentPhone}
            onChange={(e) =>
              setStudentPhone(
                e.target.value
              )
            }
          />

          {/* PARENT PHONE */}

          <input
            type="text"
            placeholder="رقم ولي الأمر"
            value={parentPhone}
            onChange={(e) =>
              setParentPhone(
                e.target.value
              )
            }
          />

          {/* PASSWORD */}

          <input
            type="password"
            placeholder="كلمة السر"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          {/* CONFIRM PASSWORD */}

          <input
            type="password"
            placeholder="تأكيد كلمة السر"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
          />

          {/* BUTTON */}

          <button type="submit">

            إنشاء الحساب

          </button>

        </form>

        {/* LOGIN */}

        <div className="login-link">

          <span>

            لديك حساب بالفعل؟

          </span>

          <a href="/login">

            تسجيل الدخول

          </a>

        </div>

      </div>

    </main>

  );

}