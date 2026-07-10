import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hypno1-amber.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Extend under the notch/home indicator so env(safe-area-inset-*) works
  // in standalone/PWA mode; fixed-bottom controls pad themselves with it.
  viewportFit: "cover",
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: "EMDR / ART Self-Administered Experience",
  description:
    "A browser-based guided EMDR, ART, and hypnotic meditation experience using bilateral stimulation, binaural tones, and evidence-based therapeutic techniques.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "EMDR / ART Self-Administered Experience",
    description:
      "Guided EMDR, ART, and hypnotic meditation using bilateral stimulation, binaural tones, and evidence-based techniques. Free, private, runs entirely in your browser.",
    url: siteUrl,
    siteName: "EMDR / ART Experience",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "EMDR / ART Self-Administered Experience",
    description:
      "Guided EMDR, ART, and hypnotic meditation using bilateral stimulation, binaural tones, and evidence-based techniques. Free, private, runs entirely in your browser.",
  },
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-trance-dark text-foreground min-h-screen">
        <noscript>
          <div style={{ padding: "2rem", textAlign: "center", color: "#e8e0d4" }}>
            <h1>JavaScript Required</h1>
            <p>This experience requires JavaScript to run. Please enable JavaScript in your browser settings.</p>
          </div>
        </noscript>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
