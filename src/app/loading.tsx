/**
 * Next.js loading boundary — shown instantly while page JS loads.
 * Pure CSS animation; no client JS required.
 */
export default function Loading() {
  return (
    <div
      className="w-screen h-screen flex items-center justify-center"
      style={{ background: "#0a0a0f" }}
    >
      {/* Pulsing gold dot — matches the app's visual language */}
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: "rgba(201, 169, 110, 0.6)",
          animation: "loadPulse 2s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes loadPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
