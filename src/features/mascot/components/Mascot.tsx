"use client";

import { motion } from "framer-motion";
import type { MascotMood, MascotVariant } from "@/types";

interface MascotProps {
  mood?: MascotMood;
  variant?: MascotVariant;
  /** px */
  size?: number;
}

const FUR_BY_VARIANT: Record<MascotVariant, string> = {
  default: "#C89B6C",
  egg: "#D6A66F",
  rookie: "#C89B6C",
  power: "#C47C3C",
  athlete: "#B86D3C",
  legend: "#A85F36",
};

const ACCENT_BY_VARIANT: Record<MascotVariant, string> = {
  default: "#BFFF00",
  egg: "#F5E6C8",
  rookie: "#BFFF00",
  power: "#FF9F0A",
  athlete: "#64D2FF",
  legend: "#FFD23F",
};

/**
 * マスコット「マッスー」— ダンベルを持ったリス風キャラクター。
 * moodで表情と腕のポーズが変わる。
 */
export function Mascot({
  mood = "happy",
  variant = "default",
  size = 96,
}: MascotProps) {
  const armsUp = mood === "cheering" || mood === "excited";
  const fur = FUR_BY_VARIANT[variant];
  const accent = ACCENT_BY_VARIANT[variant];
  const isAdvanced =
    variant === "power" || variant === "athlete" || variant === "legend";

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
      {variant !== "default" && (
        <circle cx="60" cy="62" r="48" fill={accent} opacity="0.1" />
      )}
      {variant === "egg" && (
        <path
          d="M 28 78 Q 32 36 60 22 Q 88 36 92 78 Q 84 104 60 108 Q 36 104 28 78 Z"
          fill="#F5E6C8"
          opacity="0.95"
        />
      )}
      {/* しっぽ */}
      <path
        d="M 96 78 Q 116 70 110 44 Q 106 28 92 26 Q 102 40 96 52 Q 92 62 88 68 Z"
        fill={variant === "egg" ? "#CFA56B" : "#A97C50"}
      />
      {/* 耳 */}
      <ellipse cx="42" cy="26" rx="9" ry="12" fill={fur} />
      <ellipse cx="78" cy="26" rx="9" ry="12" fill={fur} />
      <ellipse cx="42" cy="28" rx="5" ry="7" fill="#8A6138" />
      <ellipse cx="78" cy="28" rx="5" ry="7" fill="#8A6138" />
      {variant === "legend" && (
        <path
          d="M 42 22 L 50 8 L 60 22 L 70 8 L 78 22 Z"
          fill="#FFD23F"
          stroke="#8A6138"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )}
      {/* 体 */}
      <ellipse cx="60" cy="86" rx={isAdvanced ? 29 : 26} ry="22" fill={fur} />
      <path
        d="M 43 78 Q 60 68 77 78 L 72 100 Q 60 108 48 100 Z"
        fill={variant === "egg" ? "#FFF4D8" : accent}
        opacity={variant === "default" ? 0.25 : 0.95}
      />
      <ellipse cx="60" cy="92" rx="16" ry="13" fill="#EDD9BB" />
      {isAdvanced && (
        <>
          <ellipse cx="36" cy="82" rx="9" ry="12" fill={fur} />
          <ellipse cx="84" cy="82" rx="9" ry="12" fill={fur} />
        </>
      )}
      {/* 顔 */}
      <circle cx="60" cy="46" r="26" fill={fur} />
      <ellipse cx="60" cy="54" rx="15" ry="12" fill="#EDD9BB" />
      {variant !== "default" && variant !== "egg" && (
        <path
          d="M 36 39 Q 60 30 84 39"
          stroke={accent}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      )}
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
          <line x1="38" y1="74" x2="26" y2="54" stroke={fur} strokeWidth={isAdvanced ? "10" : "8"} strokeLinecap="round" />
          <line x1="82" y1="74" x2="94" y2="54" stroke={fur} strokeWidth={isAdvanced ? "10" : "8"} strokeLinecap="round" />
          {/* ダンベル（右手に掲げる） */}
          <line x1="86" y1="50" x2="102" y2="50" stroke="#8E8E93" strokeWidth="4" strokeLinecap="round" />
          <rect x="82" y="42" width="6" height="16" rx="2" fill={accent} />
          <rect x="100" y="42" width="6" height="16" rx="2" fill={accent} />
        </g>
      ) : (
        <g>
          <line x1="40" y1="76" x2="30" y2="86" stroke={fur} strokeWidth={isAdvanced ? "10" : "8"} strokeLinecap="round" />
          <line x1="80" y1="76" x2="90" y2="86" stroke={fur} strokeWidth={isAdvanced ? "10" : "8"} strokeLinecap="round" />
          {/* ダンベル（床に置く） */}
          <line x1="80" y1="94" x2="100" y2="94" stroke="#8E8E93" strokeWidth="4" strokeLinecap="round" />
          <rect x="76" y="86" width="6" height="16" rx="2" fill={accent} />
          <rect x="98" y="86" width="6" height="16" rx="2" fill={accent} />
        </g>
      )}
      {(variant === "athlete" || variant === "legend") && (
        <g>
          <path d="M 55 75 L 60 86 L 65 75" stroke="#F5F5F7" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="88" r="5" fill={accent} stroke="#F5F5F7" strokeWidth="2" />
        </g>
      )}
      {variant === "egg" && (
        <path
          d="M 34 84 L 43 78 L 52 86 L 61 78 L 70 86 L 80 78 L 88 84 Q 80 106 60 110 Q 40 106 34 84 Z"
          fill="#FFF4D8"
          opacity="0.95"
        />
      )}
    </motion.svg>
  );
}
