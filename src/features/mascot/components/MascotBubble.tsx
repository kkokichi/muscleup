"use client";

import { motion } from "framer-motion";

/** マスコットの吹き出し */
export function MascotBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-sm font-medium leading-relaxed"
    >
      {text}
    </motion.div>
  );
}
