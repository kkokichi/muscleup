"use client";

import { useEffect } from "react";
import { useMascotStore } from "@/stores/mascotStore";
import { Mascot } from "./Mascot";

const CONFETTI_COLORS = ["#BFFF00", "#FF9F0A", "#64D2FF", "#BF5AF2", "#FF375F"];

/** PB更新時の紙吹雪（CSSアニメーション） */
function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-2 h-0 overflow-visible">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="absolute size-2 rounded-sm"
          style={{
            left: `${(i * 53) % 100}%`,
            backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animation: `mascot-confetti-fall 1.4s ease-in ${(i % 6) * 0.08}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * 画面上部に表示されるマスコットのグローバルトースト。
 * セット完了・保存・PB更新などのイベントで各featureから発火される。
 * 表示アニメーションは tw-animate-css のCSSユーティリティで行い、
 * framer-motion に依存しない（環境差で非表示になる問題を回避）。
 */
export function MascotToast() {
  const { currentMessage, isCelebration, dismiss } = useMascotStore();

  useEffect(() => {
    if (!currentMessage) return;
    const timer = setTimeout(dismiss, isCelebration ? 4500 : 3000);
    return () => clearTimeout(timer);
  }, [currentMessage, isCelebration, dismiss]);

  if (!currentMessage) return null;

  return (
    <div
      key={currentMessage.id + currentMessage.text}
      onClick={dismiss}
      className="fixed inset-x-0 top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-sm"
    >
      <div className="relative flex items-center gap-3 rounded-2xl border border-border bg-popover/95 p-3 pr-4 shadow-2xl backdrop-blur-xl">
        {isCelebration && <Confetti />}
        <Mascot mood={isCelebration ? "cheering" : "happy"} size={56} />
        <p className="flex-1 text-sm font-semibold leading-snug">
          {currentMessage.text}
        </p>
      </div>
    </div>
  );
}
