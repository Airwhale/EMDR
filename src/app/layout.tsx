import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMDR / ART Self-Administered Experience",
  description:
    "A browser-based guided EMDR, ART, and self-hypnosis experience using bilateral stimulation, progressive relaxation, and evidence-based therapeutic techniques.",
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
        {children}
      </body>
    </html>
  );
}
