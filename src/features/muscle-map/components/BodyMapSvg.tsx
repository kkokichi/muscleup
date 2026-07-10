"use client";

import type { MuscleId } from "@/types";
import { muscleNameJa } from "@/types";
import { BACK_REGIONS, FRONT_REGIONS, type Shape } from "../bodyRegions";
import { ACTIVE, REGION, SILHOUETTE, Silhouette, renderShape } from "./bodySvgParts";

export type BodyView = "front" | "back";

interface BodyMapSvgProps {
  view: BodyView;
  selected: MuscleId | null;
  onSelect: (muscle: MuscleId) => void;
}

export function BodyMapSvg({ view, selected, onSelect }: BodyMapSvgProps) {
  const regions = view === "front" ? FRONT_REGIONS : BACK_REGIONS;
  const entries = Object.entries(regions) as [MuscleId, Shape[]][];

  return (
    <svg
      viewBox="0 0 240 410"
      className="mx-auto h-auto w-full max-w-[280px]"
      role="group"
      aria-label={view === "front" ? "体の前面マップ" : "体の背面マップ"}
    >
      <defs>
        <filter id="muscle-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="4"
            floodColor={ACTIVE}
            floodOpacity="0.7"
          />
        </filter>
      </defs>

      <Silhouette />

      {entries.map(([muscleId, shapes]) => {
        const isActive = selected === muscleId;
        return (
          <g
            key={muscleId}
            role="button"
            aria-label={muscleNameJa(muscleId)}
            aria-pressed={isActive}
            tabIndex={0}
            onClick={() => onSelect(muscleId)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(muscleId);
              }
            }}
            style={{ cursor: "pointer" }}
            filter={isActive ? "url(#muscle-glow)" : undefined}
            opacity={selected && !isActive ? 0.5 : 1}
          >
            {shapes.map((shape, i) =>
              renderShape(shape, isActive ? ACTIVE : REGION, i),
            )}

            {/* 腹直筋のシックスパック表現 */}
            {muscleId === "abs" && (
              <g stroke={SILHOUETTE} strokeWidth="2" opacity={isActive ? 0.5 : 0.7}>
                <line x1="120" y1="130" x2="120" y2="182" />
                <line x1="107" y1="146" x2="133" y2="146" />
                <line x1="107" y1="162" x2="133" y2="162" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
