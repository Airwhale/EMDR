"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PhaseId, sessionScript, NarrationCue } from "./sessionScript";

export interface SessionState {
  currentPhase: PhaseId;
  phaseIndex: number;
  currentCueIndex: number;
  currentCueText: string | null;
  phaseElapsed: number;
  isActive: boolean;
}

export function useSessionTimer() {
  const [state, setState] = useState<SessionState>({
    currentPhase: "entry",
    phaseIndex: 0,
    currentCueIndex: -1,
    currentCueText: null,
    phaseElapsed: 0,
    isActive: false,
  });

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const scheduleCues = useCallback(
    (narration: NarrationCue[], onComplete?: () => void) => {
      clearTimers();
      let cumulativeDelay = 0;

      narration.forEach((cue, index) => {
        cumulativeDelay += cue.delay;
        const showTime = cumulativeDelay;
        const hideTime = showTime + cue.duration;

        const showTimer = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            currentCueIndex: index,
            currentCueText: cue.text,
          }));
        }, showTime);

        const hideTimer = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            currentCueText: prev.currentCueIndex === index ? null : prev.currentCueText,
          }));
        }, hideTime);

        timersRef.current.push(showTimer, hideTimer);
        cumulativeDelay = hideTime;
      });

      if (onComplete) {
        const completeTimer = setTimeout(onComplete, cumulativeDelay + 2000);
        timersRef.current.push(completeTimer);
      }
    },
    [clearTimers]
  );

  const startPhase = useCallback(
    (phaseIndex: number) => {
      const phase = sessionScript[phaseIndex];
      if (!phase) return;

      startTimeRef.current = Date.now();

      setState({
        currentPhase: phase.id,
        phaseIndex,
        currentCueIndex: -1,
        currentCueText: null,
        phaseElapsed: 0,
        isActive: true,
      });

      // Track elapsed time
      const trackTime = () => {
        setState((prev) => ({
          ...prev,
          phaseElapsed: Date.now() - startTimeRef.current,
        }));
        rafRef.current = requestAnimationFrame(trackTime);
      };
      rafRef.current = requestAnimationFrame(trackTime);
    },
    []
  );

  const advancePhase = useCallback(() => {
    clearTimers();
    setState((prev) => {
      const nextIndex = prev.phaseIndex + 1;
      if (nextIndex >= sessionScript.length) {
        return { ...prev, isActive: false };
      }
      return prev;
    });
  }, [clearTimers]);

  const goToPhase = useCallback(
    (phaseId: PhaseId) => {
      clearTimers();
      const idx = sessionScript.findIndex((p) => p.id === phaseId);
      if (idx >= 0) startPhase(idx);
    },
    [clearTimers, startPhase]
  );

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  return {
    state,
    startPhase,
    advancePhase,
    goToPhase,
    scheduleCues,
    clearTimers,
    setState,
  };
}
