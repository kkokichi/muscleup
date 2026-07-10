import type { Shape } from "../bodyRegions";

export const SILHOUETTE = "#1c1c20";
export const OUTLINE = "#2f2f35";
export const REGION = "#41414a";
export const ACTIVE = "#bfff00";

export function renderShape(shape: Shape, fill: string, key: number) {
  switch (shape.t) {
    case "rect":
      return (
        <rect
          key={key}
          x={shape.x}
          y={shape.y}
          width={shape.w}
          height={shape.h}
          rx={shape.rx}
          fill={fill}
        />
      );
    case "ellipse":
      return (
        <ellipse
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          rx={shape.rx}
          ry={shape.ry}
          fill={fill}
        />
      );
    case "path":
      return <path key={key} d={shape.d} fill={fill} />;
  }
}

/** 前面・背面共通の体シルエット（人体は左右対称なので同一） */
export function Silhouette() {
  return (
    <g fill={SILHOUETTE} stroke={OUTLINE} strokeWidth="1.5">
      {/* 頭・首 */}
      <ellipse cx="120" cy="34" rx="19" ry="22" />
      <rect x="112" y="52" width="16" height="14" rx="5" />
      {/* 肩・胴 */}
      <ellipse cx="82" cy="82" rx="17" ry="16" />
      <ellipse cx="158" cy="82" rx="17" ry="16" />
      <path d="M88 74 Q120 66 152 74 L150 150 Q148 186 138 196 L102 196 Q92 186 90 150 Z" />
      {/* 上腕・前腕・手 */}
      <rect x="59" y="84" width="18" height="54" rx="9" />
      <rect x="163" y="84" width="18" height="54" rx="9" />
      <rect x="56" y="132" width="16" height="52" rx="8" />
      <rect x="168" y="132" width="16" height="52" rx="8" />
      <ellipse cx="64" cy="190" rx="9" ry="11" />
      <ellipse cx="176" cy="190" rx="9" ry="11" />
      {/* 骨盤・脚 */}
      <path d="M96 188 L144 188 Q150 198 146 214 L94 214 Q90 198 96 188 Z" />
      <rect x="92" y="210" width="24" height="96" rx="12" />
      <rect x="124" y="210" width="24" height="96" rx="12" />
      <rect x="95" y="300" width="20" height="90" rx="10" />
      <rect x="125" y="300" width="20" height="90" rx="10" />
      <ellipse cx="105" cy="394" rx="12" ry="7" />
      <ellipse cx="135" cy="394" rx="12" ry="7" />
    </g>
  );
}
