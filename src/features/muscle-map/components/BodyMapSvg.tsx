"use client";

import type { MuscleCategoryId } from "@/types";

export type BodyView = "front" | "back";

interface BodyMapSvgProps {
  view: BodyView;
  selected: MuscleCategoryId | null;
  onSelect: (category: MuscleCategoryId) => void;
}

const BASE = "#1e1e21";
const REGION = "#3a3a40";
const ACTIVE = "#bfff00";

interface RegionProps {
  category: MuscleCategoryId;
  selected: MuscleCategoryId | null;
  onSelect: (category: MuscleCategoryId) => void;
  children: (fill: string) => React.ReactNode;
  label: string;
}

/** タップ可能な筋肉部位。選択中はアクセント色で発光する */
function Region({ category, selected, onSelect, children, label }: RegionProps) {
  const isActive = selected === category;
  return (
    <g
      role="button"
      aria-label={label}
      tabIndex={0}
      onClick={() => onSelect(category)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(category)}
      style={{ cursor: "pointer" }}
      filter={isActive ? "url(#glow)" : undefined}
      opacity={selected && !isActive ? 0.55 : 1}
    >
      {children(isActive ? ACTIVE : REGION)}
    </g>
  );
}

/** 体のベースシルエット（前面・背面共通） */
function Silhouette() {
  return (
    <g fill={BASE} stroke="#2a2a2e" strokeWidth="1">
      <circle cx="100" cy="28" r="18" />
      <rect x="91" y="43" width="18" height="12" rx="4" />
      <rect x="60" y="53" width="80" height="135" rx="24" />
      <rect x="34" y="62" width="24" height="118" rx="12" />
      <rect x="142" y="62" width="24" height="118" rx="12" />
      <rect x="65" y="185" width="31" height="142" rx="15" />
      <rect x="104" y="185" width="31" height="142" rx="15" />
    </g>
  );
}

export function BodyMapSvg({ view, selected, onSelect }: BodyMapSvgProps) {
  const region = (category: MuscleCategoryId, label: string) => ({
    category,
    selected,
    onSelect,
    label,
  });

  return (
    <svg
      viewBox="0 0 200 340"
      className="mx-auto h-auto w-full max-w-60"
      role="group"
      aria-label={view === "front" ? "体の前面マップ" : "体の背面マップ"}
    >
      <defs>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor={ACTIVE} floodOpacity="0.6" />
        </filter>
      </defs>

      <Silhouette />

      {view === "front" ? (
        <>
          <Region {...region("shoulders", "肩")}>
            {(fill) => (
              <>
                <circle cx="66" cy="68" r="12" fill={fill} />
                <circle cx="134" cy="68" r="12" fill={fill} />
              </>
            )}
          </Region>
          <Region {...region("chest", "胸")}>
            {(fill) => (
              <>
                <rect x="70" y="76" width="27" height="26" rx="9" fill={fill} />
                <rect x="103" y="76" width="27" height="26" rx="9" fill={fill} />
              </>
            )}
          </Region>
          <Region {...region("arms", "腕")}>
            {(fill) => (
              <>
                <rect x="37" y="88" width="18" height="46" rx="9" fill={fill} />
                <rect x="145" y="88" width="18" height="46" rx="9" fill={fill} />
              </>
            )}
          </Region>
          <Region {...region("core", "腹筋")}>
            {(fill) => (
              <g>
                <rect x="80" y="108" width="40" height="66" rx="10" fill={fill} />
                <line x1="100" y1="112" x2="100" y2="170" stroke={BASE} strokeWidth="2" />
                <line x1="82" y1="128" x2="118" y2="128" stroke={BASE} strokeWidth="2" />
                <line x1="82" y1="148" x2="118" y2="148" stroke={BASE} strokeWidth="2" />
              </g>
            )}
          </Region>
          <Region {...region("legs", "脚")}>
            {(fill) => (
              <>
                <rect x="68" y="192" width="26" height="92" rx="13" fill={fill} />
                <rect x="106" y="192" width="26" height="92" rx="13" fill={fill} />
              </>
            )}
          </Region>
        </>
      ) : (
        <>
          <Region {...region("shoulders", "肩（後部）")}>
            {(fill) => (
              <>
                <circle cx="66" cy="68" r="12" fill={fill} />
                <circle cx="134" cy="68" r="12" fill={fill} />
              </>
            )}
          </Region>
          <Region {...region("back", "背中")}>
            {(fill) => (
              <path
                d="M 74 62 L 126 62 Q 130 62 129 68 L 124 118 Q 116 152 100 158 Q 84 152 76 118 L 71 68 Q 70 62 74 62 Z"
                fill={fill}
              />
            )}
          </Region>
          <Region {...region("arms", "腕（三頭筋）")}>
            {(fill) => (
              <>
                <rect x="37" y="88" width="18" height="46" rx="9" fill={fill} />
                <rect x="145" y="88" width="18" height="46" rx="9" fill={fill} />
              </>
            )}
          </Region>
          <Region {...region("legs", "脚（もも裏・お尻）")}>
            {(fill) => (
              <>
                <rect x="74" y="162" width="52" height="26" rx="12" fill={fill} />
                <rect x="68" y="194" width="26" height="88" rx="13" fill={fill} />
                <rect x="106" y="194" width="26" height="88" rx="13" fill={fill} />
              </>
            )}
          </Region>
        </>
      )}
    </svg>
  );
}
