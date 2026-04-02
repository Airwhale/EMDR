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
        {children}
      </body>
    </html>
  );
}
