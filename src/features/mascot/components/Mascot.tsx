"use client";

import { motion } from "framer-motion";
import type { MascotMood } from "@/types";

interface MascotProps {
  mood?: MascotMood;
  /** px */
  size?: number;
}

/**
 * マスコット「マッスー」— ダンベルを持ったリス風キャラクター。
 * moodで表情と腕のポーズが変わる。
 */
export function Mascot({ mood = "happy", size = 96 }: MascotProps) {
  const armsUp = mood === "cheering" || mood === "excited";

  return (
    <motion.svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label="マスコットのマッスー"
      animate={
        mood === "excited" || mood === "cheering"
          ? { y: [0, -6, 0] }
          : { y: [0, -2, 0] }
      }
      transition={{
        repeat: Infinity,
        duration: mood === "excited" || mood === "cheering" ? 0.6 : 2.4,
        ease: "easeInOut",
      }}
    >
      {/* しっぽ */}
      <path
        d="M 96 78 Q 116 70 110 44 Q 106 28 92 26 Q 102 40 96 52 Q 92 62 88 68 Z"
        fill="#A97C50"
      />
      {/* 耳 */}
      <ellipse cx="42" cy="26" rx="9" ry="12" fill="#C89B6C" />
      <ellipse cx="78" cy="26" rx="9" ry="12" fill="#C89B6C" />
      <ellipse cx="42" cy="28" rx="5" ry="7" fill="#8A6138" />
      <ellipse cx="78" cy="28" rx="5" ry="7" fill="#8A6138" />
      {/* 体 */}
      <ellipse cx="60" cy="86" rx="26" ry="22" fill="#C89B6C" />
      <ellipse cx="60" cy="92" rx="16" ry="13" fill="#EDD9BB" />
      {/* 顔 */}
      <circle cx="60" cy="46" r="26" fill="#C89B6C" />
      <ellipse cx="60" cy="54" rx="15" ry="12" fill="#EDD9BB" />
      {/* 目 */}
      {mood === "sleeping" ? (
        <>
          <path d="M 44 44 Q 49 48 54 44" stroke="#3B2A18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 66 44 Q 71 48 76 44" stroke="#3B2A18" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="49" cy="44" r="4" fill="#3B2A18" />
          <circle cx="71" cy="44" r="4" fill="#3B2A18" />
          <circle cx="50.5" cy="42.5" r="1.4" fill="#FFF" />
          <circle cx="72.5" cy="42.5" r="1.4" fill="#FFF" />
        </>
      )}
      {/* ほっぺ */}
      <circle cx="41" cy="52" r="4.5" fill="#F2A886" opacity="0.7" />
      <circle cx="79" cy="52" r="4.5" fill="#F2A886" opacity="0.7" />
      {/* 口 */}
      {mood === "excited" || mood === "cheering" ? (
        <path d="M 54 56 Q 60 64 66 56 Z" fill="#7A4A2B" />
      ) : (
        <path d="M 55 57 Q 60 61 65 57" stroke="#7A4A2B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {/* 腕 + ダンベル */}
      {armsUp ? (
        <g>
          <line x1="38" y1="74" x2="26" y2="54" stroke="#C89B6C" strokeWidth="8" strokeLinecap="round" />
          <line x1="82" y1="74" x2="94" y2="54" stroke="#C89B6C" strokeWidth="8" strokeLinecap="round" />
          {/* ダンベル（右手に掲げる） */}
          <line x1="86" y1="50" x2="102" y2="50" stroke="#8E8E93" strokeWidth="4" strokeLinecap="round" />
          <rect x="82" y="42" width="6" height="16" rx="2" fill="#BFFF00" />
          <rect x="100" y="42" width="6" height="16" rx="2" fill="#BFFF00" />
        </g>
      ) : (
        <g>
          <line x1="40" y1="76" x2="30" y2="86" stroke="#C89B6C" strokeWidth="8" strokeLinecap="round" />
          <line x1="80" y1="76" x2="90" y2="86" stroke="#C89B6C" strokeWidth="8" strokeLinecap="round" />
          {/* ダンベル（床に置く） */}
          <line x1="80" y1="94" x2="100" y2="94" stroke="#8E8E93" strokeWidth="4" strokeLinecap="round" />
          <rect x="76" y="86" width="6" height="16" rx="2" fill="#BFFF00" />
          <rect x="98" y="86" width="6" height="16" rx="2" fill="#BFFF00" />
        </g>
      )}
    </motion.svg>
  );
}
