"use client";

import { motion } from "framer-motion";

interface FadeInProps {
  children: React.ReactNode;
  /** stagger用の遅延（秒） */
  delay?: number;
  className?: string;
}

/** カード出現の標準アニメーション（docs/12: y 12→0, 0.35s easeOut） */
export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
