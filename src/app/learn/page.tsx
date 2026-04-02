"use client";

import { useRouter } from "next/navigation";
import LearnContent from "@/components/shared/LearnContent";

export default function LearnPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-trance-dark text-[#e8e0d4] overflow-y-auto">
      <LearnContent
        onBack={() => router.push("/")}
        onReady={() => router.push("/")}
      />
    </main>
  );
}
