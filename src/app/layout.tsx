import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRANCE — A Guided Hypnotic Experience",
  description:
    "An interactive self-hypnosis session using visual fixation, synchronized breathing, progressive relaxation, and suggestibility experiments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-trance-dark text-foreground min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
