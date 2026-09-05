"use client";
import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const IDLE_TIMEOUT_MS = 60 * 1000;
const ACTIVITY_THROTTLE_MS = 5 * 1000;
const CHECK_INTERVAL_MS = 15 * 1000;
const STORAGE_KEY = "nexora:last-activity";

export function IdleSessionGuard() {
  const router = useRouter();
  const lastRecordedAt = useRef(0);
  const loggingOut = useRef(false);
  const writeActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastRecordedAt.current < ACTIVITY_THROTTLE_MS) {
      return;
    }
    lastRecordedAt.current = now;
    localStorage.setItem(STORAGE_KEY, String(now));
  }, []);

  const getLastActivity = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY, String(now));
      return now;
    }

    const value = Number(stored);
    if (!Number.isFinite(value) || value <= 0) {
      const now = Date.now();
      localStorage.setItem(STORAGE_KEY, String(now));
      return now;
    }

    return value;
  }, []);

  const logout = useCallback(async () => {
    if (loggingOut.current) {
      return;
    }
    loggingOut.current = true;
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      // Redirect tetap dilakukan.
      // Jika koneksi bermasalah,
      // auth guard akan memvalidasi
      // session kembali pada request berikutnya.
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      router.replace("/login");
      router.refresh();
    }
  }, [router]);

  const checkIdle = useCallback(() => {
    const lastActivity = getLastActivity();
    const idleFor = Date.now() - lastActivity;
    if (idleFor >= IDLE_TIMEOUT_MS) {
      void logout();
    }
  }, [getLastActivity, logout]);

  useEffect(() => {
    writeActivity();

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, writeActivity, {
        passive: true,
      });
    }

    const handleFocus = () => {
      writeActivity();
      checkIdle();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkIdle();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        checkIdle();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const interval = window.setInterval(checkIdle, CHECK_INTERVAL_MS);
    checkIdle();

    return () => {
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, writeActivity);
      }

      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.clearInterval(interval);
    };
  }, [checkIdle, writeActivity]);

  return null;
}
