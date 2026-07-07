"use client";

import { useEffect } from "react";

/**
 * Keeps the screen awake for the lifetime of the component using the
 * Screen Wake Lock API.
 *
 * Sessions here are long and touch-free — the user just watches and
 * listens. Without a wake lock, mobile screens dim and lock a few
 * minutes in, which suspends audio and kills the session.
 *
 * The browser releases the lock automatically whenever the tab is
 * hidden (tab switch, screen lock), so we re-acquire it every time the
 * tab becomes visible again. Silently no-ops where unsupported.
 */
export function useWakeLock(): void {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await lock.release();
        } else {
          sentinel = lock;
        }
      } catch {
        // Request can be denied (low battery, browser policy) — fine
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      sentinel?.release().catch(() => {});
    };
  }, []);
}
