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
    <div className="flex items-center justify-center min-h-[120px] px-8 relative">
      <AnimatePresence>
        {text && (
          <motion.p
            key={text}
            className={`narration-text text-glow text-center max-w-2xl ${fontSize} text-[#e8e0d4]/90 absolute`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
