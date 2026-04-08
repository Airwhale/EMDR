"use client";

interface EmdrDotProps {
  cycleDuration?: number;
  size?: number;
  /** Travel range as vw (e.g. 35 = ±35vw from center) */
  rangeVw?: number;
}

/**
 * EMDR-style dot — uses a CSS keyframe animation with vw units so the
 * travel range is inherently viewport-relative. Avoids Framer Motion's
 * string-unit interpolation issues with infinite x animations.
 */
export default function EmdrDot({
  cycleDuration = 4,
  size = 12,
  rangeVw = 35,
}: EmdrDotProps) {
  // Unique keyframe name per rangeVw so multiple instances don't conflict
  const animName = `emdr-sweep-${rangeVw}`;

  return (
    <>
      <style>{`
        @keyframes ${animName} {
          0%, 100% { transform: translateX(-${rangeVw}vw); }
          50%       { transform: translateX(${rangeVw}vw);  }
        }
      `}</style>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {/* Main dot */}
        <div
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            background: "radial-gradient(circle, rgba(255,255,255,1), rgba(230,220,200,0.5))",
            boxShadow: "0 0 18px rgba(255,255,255,0.6), 0 0 60px rgba(201,169,110,0.2)",
            animation: `${animName} ${cycleDuration}s ease-in-out infinite`,
          }}
        />
        {/* Afterimage trail */}
        <div
          className="absolute rounded-full"
          style={{
            width: size * 0.6,
            height: size * 0.6,
            background: "radial-gradient(circle, rgba(255,255,255,0.4), transparent)",
            filter: "blur(4px)",
            animation: `${animName} ${cycleDuration}s ease-in-out infinite`,
            animationDelay: "0.1s",
          }}
        />
      </div>
    </>
  );
}
