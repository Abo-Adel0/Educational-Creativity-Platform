async function readResponse(res) {
  let data = {};

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok && data.success === undefined) {
    return {
      success: false,
      message: data.message || "حدث خطأ غير متوقع",
    };
  }

  return data;
}

export async function getCurrentUser() {
  if (typeof window === "undefined") return null;

  try {
    const res = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "include",
    });

    const data = await readResponse(res);

    return data.success ? data.user : null;
  } catch {
    return null;
  }
}

export async function loginUser(dataOrPhone, passwordArg) {
  const data =
    typeof dataOrPhone === "object"
      ? dataOrPhone
      : {
          phone: dataOrPhone,
          password: passwordArg,
        };

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        phone: data.phone || data.studentPhone,
        password: data.password,
      }),
    });

    return await readResponse(res);
  } catch {
    return {
      success: false,
      message: "تعذر الاتصال بالخادم",
    };
  }
}

export async function registerUser(dataOrPhone, parentPhoneArg, passwordArg, confirmPasswordArg) {
  const data =
    typeof dataOrPhone === "object"
      ? dataOrPhone
      : {
          studentPhone: dataOrPhone,
          parentPhone: parentPhoneArg,
          password: passwordArg,
          confirmPassword: confirmPasswordArg,
        };

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return await readResponse(res);
  } catch {
    return {
      success: false,
      message: "تعذر الاتصال بالخادم",
    };
  }
}

export async function logoutUser() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch {}

  return {
    success: true,
    message: "تم تسجيل الخروج",
  };
}

export async function getUsers() {
  try {
    const res = await fetch("/api/users", {
      cache: "no-store",
      credentials: "include",
    });

    const data = await readResponse(res);

    return data.success ? data.users || [] : [];
  } catch {
    return [];
  }
}

async function userAction(action, payload) {
  try {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ action, ...payload }),
    });

    return await readResponse(res);
  } catch {
    return {
      success: false,
      message: "تعذر تنفيذ العملية",
    };
  }
}

export function addAdmin(phone) {
  return userAction("addAdmin", { phone });
}

export function removeAdmin(phone) {
  return userAction("removeAdmin", { phone });
}

export function changePassword(phone, newPassword) {
  return userAction("changePassword", { phone, newPassword });
}

export function toggleBlockUser(phone) {
  return userAction("toggleBlock", { phone });
}

export function deleteUser(phone) {
  return userAction("deleteUser", { phone });
}
