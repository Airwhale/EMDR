"use client";

import { motion, AnimatePresence } from "framer-motion";

interface NarrationDisplayProps {
  text: string | null;
  size?: "normal" | "large";
}

export default function NarrationDisplay({
  text,
  size = "normal",
}: NarrationDisplayProps) {
  const fontSize = size === "large" ? "text-3xl md:text-4xl" : "text-xl md:text-2xl";

  return (
    <div
      className="flex items-center justify-center px-8 w-full"
      style={{ minHeight: 80 }}
    >
      <AnimatePresence mode="wait">
        {text && (
          <motion.p
            key={text}
            className={`narration-text text-glow text-center ${fontSize} text-[#e8e0d4]/90`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
