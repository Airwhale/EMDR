"use client";

/**
 * Next.js route-level error boundary. Catches errors the in-tree
 * ErrorBoundary cannot (e.g. exceptions thrown from App's own effects)
 * so users never see the default blank "Application error" screen.
 */
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-trance-dark"
      style={{ background: "#0a0a0f" }}
    >
      <div className="flex flex-col items-center gap-8 text-center max-w-lg">
        <h1 className="narration-text text-2xl text-gold/85">Something went wrong</h1>

        <p className="narration-text text-lg text-[#e8e0d4]/60">
          Take a deep breath. You&apos;re okay.
        </p>

        <div className="space-y-3 w-full">
          <div className="p-4 border border-gold/25 rounded-xl">
            <p className="text-sm text-gold/80 font-light">988 Suicide &amp; Crisis Lifeline</p>
            <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">
              Call or text <span className="text-gold/80">988</span>, available 24/7
            </p>
          </div>
          <div className="p-4 border border-[#e8e0d4]/15 rounded-xl">
            <p className="text-sm text-[#e8e0d4]/60 font-light">Crisis Text Line</p>
            <p className="text-xs text-[#e8e0d4]/50 font-light mt-1">
              Text <span className="text-gold/80">HOME</span> to 741741
            </p>
          </div>
        </div>

        <button
          onClick={reset}
          className="mt-2 px-8 py-3 border border-gold/45 rounded-full text-gold/85
                     hover:border-gold/75 hover:text-gold transition-all duration-700 ui-text"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
