"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentUser } from "../utils/auth";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
  requireOwner = false,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      const user = await getCurrentUser();

      if (!active) return;

      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`);
        return;
      }

      if (requireOwner && user.role !== "owner") {
        router.replace("/");
        return;
      }

      if (
        requireAdmin &&
        user.role !== "owner" &&
        user.role !== "admin"
      ) {
        router.replace("/");
        return;
      }

      setAllowed(true);
      setChecking(false);
    };

    checkUser();

    return () => {
      active = false;
    };
  }, [router, pathname, requireAdmin, requireOwner]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-[440px]">
          <h1 className="text-2xl md:text-3xl main-title text-[var(--gold-primary)] mb-4">
            جاري التحقق من الصلاحيات...
          </h1>

          <p className="text-[var(--text-secondary)] leading-[2]">
            برجاء الانتظار لحظات.
          </p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return null;
  }

  return children;
}
