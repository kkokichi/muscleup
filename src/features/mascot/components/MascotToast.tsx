"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMascotStore } from "@/stores/mascotStore";
import { Mascot } from "./Mascot";

const CONFETTI_COLORS = ["#BFFF00", "#FF9F0A", "#64D2FF", "#BF5AF2", "#FF375F"];

/** PB更新時の紙吹雪 */
function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-2 h-0 overflow-visible">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute size-2 rounded-sm"
          style={{
            left: `${(i * 53) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
          initial={{ y: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 120 + (i % 5) * 30, opacity: 0, rotate: 360 }}
          transition={{ duration: 1.4, delay: (i % 6) * 0.08, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/**
 * 画面上部に表示されるマスコットのグローバルトースト。
 * セット完了・保存・PB更新などのイベントで各featureから発火される。
 */
export function MascotToast() {
  const { currentMessage, isCelebration, dismiss } = useMascotStore();

  useEffect(() => {
    if (!currentMessage) return;
    const timer = setTimeout(dismiss, isCelebration ? 4500 : 3000);
    return () => clearTimeout(timer);
  }, [currentMessage, isCelebration, dismiss]);

  return (
    <AnimatePresence>
      {currentMessage && (
        <motion.div
          key={currentMessage.id + currentMessage.text}
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="fixed inset-x-0 top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-sm"
          onClick={dismiss}
        >
          <div className="relative flex items-center gap-3 rounded-2xl border border-border bg-popover/95 p-3 pr-4 shadow-2xl backdrop-blur-xl">
            {isCelebration && <Confetti />}
            <Mascot mood={isCelebration ? "cheering" : "happy"} size={56} />
            <p className="flex-1 text-sm font-semibold leading-snug">
              {currentMessage.text}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
