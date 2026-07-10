"use client";

import type { MuscleId } from "@/types";
import { BACK_REGIONS, FRONT_REGIONS, type Shape } from "@/features/muscle-map/bodyRegions";
import { REGION, Silhouette, renderShape } from "@/features/muscle-map/components/bodySvgParts";

interface BodyHeatmapProps {
  /** muscleId -> 0..1 の刺激強度 */
  heat: Record<string, number>;
}

/** 強度0-1を、控えめグレー→ライムの塗りに変換 */
function heatColor(value: number): string {
  if (value <= 0) return REGION;
  const opacity = 0.2 + value * 0.8;
  return `rgba(191,255,0,${opacity.toFixed(2)})`;
}

function HalfBody({
  regions,
  heat,
  label,
}: {
  regions: Partial<Record<MuscleId, Shape[]>>;
  heat: Record<string, number>;
  label: string;
}) {
  const entries = Object.entries(regions) as [MuscleId, Shape[]][];
  return (
    <div className="flex flex-1 flex-col items-center">
      <svg
        viewBox="0 0 240 410"
        className="h-auto w-full max-w-[150px]"
        role="img"
        aria-label={label}
      >
        <Silhouette />
        {entries.map(([muscleId, shapes]) => (
          <g key={muscleId}>
            {shapes.map((shape, i) =>
              renderShape(shape, heatColor(heat[muscleId] ?? 0), i),
            )}
          </g>
        ))}
      </svg>
      <span className="mt-1 text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

/** 直近の刺激量を人体イラストに重ねるヒートマップ（前面・背面） */
export function BodyHeatmap({ heat }: BodyHeatmapProps) {
  return (
    <div className="flex justify-center gap-2">
      <HalfBody regions={FRONT_REGIONS} heat={heat} label="前面" />
      <HalfBody regions={BACK_REGIONS} heat={heat} label="背面" />
    </div>
  );
}
