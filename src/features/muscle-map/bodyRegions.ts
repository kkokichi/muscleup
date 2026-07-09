import type { MuscleId } from "@/types";

/** SVGで筋肉領域を描くための最小シェイプ表現 */
export type Shape =
  | { t: "rect"; x: number; y: number; w: number; h: number; rx: number }
  | { t: "ellipse"; cx: number; cy: number; rx: number; ry: number }
  | { t: "path"; d: string };

/** 前面・背面それぞれで、筋肉IDごとに描画シェイプを定義する */
export const FRONT_REGIONS: Partial<Record<MuscleId, Shape[]>> = {
  "side-delt": [
    { t: "ellipse", cx: 69, cy: 86, rx: 9, ry: 13 },
    { t: "ellipse", cx: 171, cy: 86, rx: 9, ry: 13 },
  ],
  "front-delt": [
    { t: "ellipse", cx: 82, cy: 82, rx: 12, ry: 12 },
    { t: "ellipse", cx: 158, cy: 82, rx: 12, ry: 12 },
  ],
  "chest-upper": [
    { t: "rect", x: 92, y: 90, w: 25, h: 11, rx: 6 },
    { t: "rect", x: 123, y: 90, w: 25, h: 11, rx: 6 },
  ],
  "chest-mid": [
    { t: "rect", x: 92, y: 102, w: 25, h: 11, rx: 6 },
    { t: "rect", x: 123, y: 102, w: 25, h: 11, rx: 6 },
  ],
  "chest-lower": [
    { t: "rect", x: 95, y: 114, w: 22, h: 11, rx: 7 },
    { t: "rect", x: 123, y: 114, w: 22, h: 11, rx: 7 },
  ],
  biceps: [
    { t: "rect", x: 61, y: 92, w: 15, h: 32, rx: 7 },
    { t: "rect", x: 164, y: 92, w: 15, h: 32, rx: 7 },
  ],
  forearms: [
    { t: "rect", x: 57, y: 134, w: 14, h: 44, rx: 7 },
    { t: "rect", x: 169, y: 134, w: 14, h: 44, rx: 7 },
  ],
  abs: [{ t: "rect", x: 105, y: 128, w: 30, h: 56, rx: 8 }],
  obliques: [
    { t: "rect", x: 95, y: 132, w: 8, h: 46, rx: 4 },
    { t: "rect", x: 137, y: 132, w: 8, h: 46, rx: 4 },
  ],
  quads: [
    { t: "rect", x: 93, y: 218, w: 21, h: 80, rx: 10 },
    { t: "rect", x: 126, y: 218, w: 21, h: 80, rx: 10 },
  ],
};

export const BACK_REGIONS: Partial<Record<MuscleId, Shape[]>> = {
  traps: [{ t: "path", d: "M120 62 L150 92 Q120 100 90 92 Z" }],
  "rear-delt": [
    { t: "ellipse", cx: 80, cy: 84, rx: 12, ry: 12 },
    { t: "ellipse", cx: 160, cy: 84, rx: 12, ry: 12 },
  ],
  lats: [
    { t: "path", d: "M118 96 L118 150 Q100 148 92 122 Q90 104 104 98 Z" },
    { t: "path", d: "M122 96 L122 150 Q140 148 148 122 Q150 104 136 98 Z" },
  ],
  "lower-back": [{ t: "rect", x: 107, y: 150, w: 26, h: 40, rx: 8 }],
  triceps: [
    { t: "rect", x: 61, y: 94, w: 15, h: 34, rx: 7 },
    { t: "rect", x: 164, y: 94, w: 15, h: 34, rx: 7 },
  ],
  glutes: [
    { t: "path", d: "M120 192 Q98 190 96 210 Q100 226 120 224 Z" },
    { t: "path", d: "M120 192 Q142 190 144 210 Q140 226 120 224 Z" },
  ],
  hamstrings: [
    { t: "rect", x: 93, y: 226, w: 21, h: 72, rx: 10 },
    { t: "rect", x: 126, y: 226, w: 21, h: 72, rx: 10 },
  ],
  calves: [
    { t: "rect", x: 96, y: 304, w: 19, h: 62, rx: 9 },
    { t: "rect", x: 125, y: 304, w: 19, h: 62, rx: 9 },
  ],
};
