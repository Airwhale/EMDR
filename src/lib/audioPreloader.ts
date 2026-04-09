/**
 * Background MP3 preloader. Fetches audio files into the browser cache
 * so subsequent `new Audio(url)` loads are instant.
 *
 * Uses `<link rel="prefetch">` for zero-cost background loading that
 * doesn't compete with active audio playback.
 */

const preloaded = new Set<string>();

/** Preload a single audio file in the background. No-op if already preloaded. */
export function preloadAudio(url: string): void {
  if (preloaded.has(url) || typeof document === "undefined") return;
  preloaded.add(url);

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.as = "audio";
  link.href = url;
  document.head.appendChild(link);
}

/** Preload a batch of audio files. */
export function preloadAudioBatch(urls: readonly string[]): void {
  for (const url of urls) {
    preloadAudio(url);
  }
}

// ── EMDR phase audio maps ──────────────────────────────────────
// Organized by phase so components can preload the *next* phase's files.

export const emdrAudio = {
  centering: [
    "/audio/emdr/emdr-centering-01.mp3",
    "/audio/emdr/emdr-centering-02.mp3",
  ],
  safePlace: [
    "/audio/emdr/emdr-safeplace-01.mp3",
    "/audio/emdr/emdr-safeplace-02.mp3",
    "/audio/emdr/emdr-safeplace-03.mp3",
    "/audio/emdr/emdr-safeplace-04.mp3",
    "/audio/emdr/emdr-safeplace-bls.mp3",
  ],
  butterfly: [
    "/audio/emdr/emdr-butterfly-01.mp3",
    "/audio/emdr/emdr-butterfly-02.mp3",
    "/audio/emdr/emdr-butterfly-03.mp3",
    "/audio/emdr/emdr-butterfly-04.mp3",
    "/audio/emdr/emdr-butterfly-05.mp3",
    "/audio/emdr/emdr-butterfly-06.mp3",
  ],
  container: [
    "/audio/emdr/emdr-container-01.mp3",
    "/audio/emdr/emdr-container-02.mp3",
    "/audio/emdr/emdr-container-03.mp3",
    "/audio/emdr/emdr-container-bls.mp3",
  ],
  resource: [
    "/audio/emdr/emdr-resource-01.mp3",
    "/audio/emdr/emdr-resource-02.mp3",
    "/audio/emdr/emdr-resource-03.mp3",
    "/audio/emdr/emdr-resource-bls.mp3",
  ],
  bodyScan: [
    "/audio/emdr/emdr-bodyscan-01.mp3",
    "/audio/emdr/emdr-bodyscan-02.mp3",
  ],
  closing: [
    "/audio/emdr/emdr-closing-01.mp3",
  ],
} as const;

export const artAudio = {
  centering: [
    "/audio/art/art-centering-01.mp3",
    "/audio/art/art-centering-02.mp3",
  ],
  scene: [
    "/audio/art/art-scene-01.mp3",
    "/audio/art/art-scene-02.mp3",
  ],
  processing: [
    "/audio/art/art-processing-01.mp3",
    "/audio/art/art-processing-02.mp3",
    "/audio/art/art-processing-return-01.mp3",
    "/audio/art/art-processing-return-02.mp3",
  ],
  sensation: [
    "/audio/art/art-sensation-01.mp3",
    "/audio/art/art-sensation-bls.mp3",
  ],
  vir: [
    "/audio/art/art-vir-01.mp3",
    "/audio/art/art-vir-02.mp3",
    "/audio/art/art-vir-bls.mp3",
  ],
  bodyScan: [
    "/audio/art/art-bodyscan-01.mp3",
    "/audio/art/art-bodyscan-02.mp3",
  ],
  closing: [
    "/audio/art/art-closing-01.mp3",
  ],
} as const;
