"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { TranceAudioEngine } from "@/lib/TranceAudioEngine";
import BilateralDot from "@/components/shared/BilateralDot";
import Vignette from "@/components/Vignette";

interface LateralSessionProps {
  onExit: () => void;
}

export default function LateralSession({ onExit }: LateralSessionProps) {
  const [speed, setSpeed] = useState(0.5);       // half-cycle seconds (0.2 = fast, 1.0 = slow)
  const [soundVol, setSoundVol] = useState(0.25);  // 0-1 ping volume
  const [binauralHz, setBinauralHz] = useState(4); // 0 = off, 1-12 Hz
  const [droneVol, setDroneVol] = useState(1.0);  // 0-2 binaural drone volume
  const [pinkVol, setPinkVol] = useState(0);       // pink noise volume
  const [showControls, setShowControls] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const audioRef = useRef<TranceAudioEngine | null>(null);
  const startTimeRef = useRef(Date.now());

  // Init audio
  useEffect(() => {
    const audio = new TranceAudioEngine();
    audio.init("emdr");
    audio.fadeIn(3, droneVol);
    audio.setBinauralBeat(binauralHz, 1);
    audioRef.current = audio;

    startTimeRef.current = Date.now();

    return () => { audio.stop(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // React to slider changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.setMasterVolume(droneVol, 1);
  }, [droneVol]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.setBinauralBeat(binauralHz, 0.3);
  }, [binauralHz]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.setPingVolume(soundVol);
  }, [soundVol]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.setPinkNoiseVolume(pinkVol);
  }, [pinkVol]);

  const handleExit = useCallback(() => {
    audioRef.current?.fadeOut(2);
    setTimeout(() => {
      audioRef.current?.stop();
      onExit();
    }, 2500);
  }, [onExit]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const binauralLabel = binauralHz === 0 ? "Off" :
    binauralHz < 0.5 ? `${binauralHz}Hz (sub-delta — experimental)` :
    binauralHz <= 4 ? `${binauralHz}Hz (delta/theta)` :
    binauralHz <= 8 ? `${binauralHz}Hz (theta/alpha)` :
    binauralHz <= 13 ? `${binauralHz}Hz (alpha/beta)` :
    binauralHz <= 30 ? `${binauralHz}Hz (beta)` :
    `${binauralHz}Hz (gamma)`;

  const binauralWarning = binauralHz > 30
    ? "gamma — may increase alertness"
    : binauralHz > 13
    ? "beta — active/alert state"
    : binauralHz > 0 && binauralHz < 0.5
    ? "sub-delta — experimental, may have no effect"
    : null;

  const speedLabel = speed <= 0.3 ? "Fast" : speed <= 0.5 ? "Medium" : speed <= 0.7 ? "Slow" : "Very slow";

  return (
    <main className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden bg-trance-dark">
      <Vignette intensity={0.3} />

      {/* Bilateral dot */}
      <div className="absolute top-[35%] w-full z-10">
        <BilateralDot
          halfCycleSec={speed}
          size={24}
          active={true}
          audio={audioRef.current}
          color="white"
          showContinue={false}
        />
      </div>

      {/* Toggle controls — tab on right edge */}
      <button
        onClick={() => setShowControls(!showControls)}
        aria-label={showControls ? "Hide controls" : "Show controls"}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-50
                   flex items-center justify-center
                   w-7 h-16 rounded-l-lg
                   border border-r-0 border-gold/25
                   hover:border-gold/45 hover:bg-gold/5
                   transition-all duration-300"
        style={{ background: "rgba(10, 10, 15, 0.8)" }}
      >
        <span className="text-gold/50 text-xs select-none">
          {showControls ? "›" : "‹"}
        </span>
      </button>

      {/* Exit */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        whileHover={{ opacity: 0.9 }}
        transition={{ duration: 0.8 }}
        onClick={handleExit}
        className="fixed top-4 left-4 z-50 ui-text text-[11px] text-[#e8e0d4]/50
                   hover:text-[#e8e0d4]/80 transition-colors duration-300"
      >
        ← exit
      </motion.button>

      {/* Timer */}
      <span className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 ui-text text-[10px] text-[#e8e0d4]/20">
        {formatTime(elapsed)}
      </span>

      {/* Control panel */}
      {showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-12 inset-x-0 z-50 px-4"
        >
          <div className="border border-gold/20 rounded-2xl p-5 max-w-xl mx-auto"
               style={{ background: "rgba(10, 10, 15, 0.9)" }}>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">

              {/* Left column */}

              {/* Speed */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="ui-text text-[10px] text-[#e8e0d4]/50">dot speed</span>
                  <span className="ui-text text-[10px] text-gold/60">{speedLabel}</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={1.2 - speed}
                  onChange={(e) => setSpeed(1.2 - parseFloat(e.target.value))}
                  aria-label={`Dot speed: ${speedLabel}`}
                  className="w-full accent-gold"
                />
              </div>

              {/* Binaural Hz */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="ui-text text-[10px] text-[#e8e0d4]/50">binaural frequency</span>
                  <span className="ui-text text-[10px] text-gold/60">{binauralLabel}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="0.1"
                  value={binauralHz}
                  onChange={(e) => setBinauralHz(parseFloat(e.target.value))}
                  aria-label={`Binaural frequency: ${binauralLabel}`}
                  className="w-full accent-gold"
                />
                {binauralWarning && (
                  <p className="ui-text text-[9px] text-blue-300/70 mt-1">{binauralWarning}</p>
                )}
              </div>

              {/* Drone volume */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="ui-text text-[10px] text-[#e8e0d4]/50">binaural volume</span>
                  <span className="ui-text text-[10px] text-gold/60">{Math.round(droneVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={droneVol}
                  onChange={(e) => setDroneVol(parseFloat(e.target.value))}
                  aria-label={`Binaural volume: ${Math.round(droneVol * 100)}%`}
                  className="w-full accent-gold"
                />
              </div>

              {/* Ping sound volume */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="ui-text text-[10px] text-[#e8e0d4]/50">ping sound</span>
                  <span className="ui-text text-[10px] text-gold/60">{Math.round(soundVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVol}
                  onChange={(e) => setSoundVol(parseFloat(e.target.value))}
                  aria-label={`Ping sound volume: ${Math.round(soundVol * 100)}%`}
                  className="w-full accent-gold"
                />
              </div>

              {/* Pink noise volume */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="ui-text text-[10px] text-[#e8e0d4]/50">pink noise</span>
                  <span className="ui-text text-[10px] text-gold/60">{Math.round(pinkVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.15"
                  step="0.01"
                  value={pinkVol}
                  onChange={(e) => setPinkVol(parseFloat(e.target.value))}
                  aria-label={`Pink noise volume: ${Math.round(pinkVol * 100)}%`}
                  className="w-full accent-gold"
                />
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </main>
  );
}
