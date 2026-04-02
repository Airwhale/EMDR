"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

interface SpeedContextValue {
  speed: number;
}

const SpeedContext = createContext<SpeedContextValue>({ speed: 1 });

export function useSpeed(): number {
  return useContext(SpeedContext).speed;
}

interface SpeedProviderProps {
  children: ReactNode;
}

/**
 * Provides a global speed multiplier. When the speed-up button is held,
 * setTimeout is patched to divide delays by the multiplier (for delays >100ms),
 * making all narration/phase timers run faster. Components can also read
 * the speed via useSpeed() for real-time adjustments (breathing, BLS dots, voice).
 */
export function SpeedProvider({ children }: SpeedProviderProps) {
  const [speed, setSpeed] = useState(1);
  const originalSetTimeout = useRef<typeof setTimeout | null>(null);
  const originalSetInterval = useRef<typeof setInterval | null>(null);

  // Patch/unpatch setTimeout and setInterval
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Store originals once
    if (!originalSetTimeout.current) {
      originalSetTimeout.current = window.setTimeout.bind(window);
    }
    if (!originalSetInterval.current) {
      originalSetInterval.current = window.setInterval.bind(window);
    }

    const origST = originalSetTimeout.current;
    const origSI = originalSetInterval.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;

    if (speed > 1) {
      w.setTimeout = (fn: Parameters<typeof setTimeout>[0], delay?: number, ...args: unknown[]) => {
        const scaled = delay && delay > 100 ? Math.round(delay / speed) : delay;
        return origST(fn, scaled as number, ...args);
      };
      w.setInterval = (fn: Parameters<typeof setInterval>[0], delay?: number, ...args: unknown[]) => {
        const scaled = delay && delay > 100 ? Math.round(delay / speed) : delay;
        return origSI(fn, scaled as number, ...args);
      };
    } else {
      w.setTimeout = origST;
      w.setInterval = origSI;
    }

    return () => {
      // Always restore on cleanup
      (window as unknown as Record<string, unknown>).setTimeout = origST;
      (window as unknown as Record<string, unknown>).setInterval = origSI;
    };
  }, [speed]);

  const handlePointerDown = useCallback(() => setSpeed(4), []);
  const handlePointerUp = useCallback(() => setSpeed(1), []);

  // Also reset on pointer leave (if finger/mouse leaves the button)
  const handlePointerLeave = useCallback(() => setSpeed(1), []);

  return (
    <SpeedContext.Provider value={{ speed }}>
      {children}

      {/* Speed-up button — fixed position, always visible */}
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        className={`fixed top-4 right-4 z-[100] px-3 py-1.5 rounded-full
                    ui-text text-[10px] select-none touch-none
                    transition-all duration-200
                    ${speed > 1
                      ? "border border-gold/60 text-gold/90 bg-gold/10"
                      : "border border-[#e8e0d4]/15 text-[#e8e0d4]/25 hover:text-[#e8e0d4]/50 hover:border-[#e8e0d4]/30"
                    }`}
      >
        {speed > 1 ? "4× ▶▶" : "4×"}
      </button>
    </SpeedContext.Provider>
  );
}
