"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { MuscleMapView } from "@/features/muscle-map/components/MuscleMapView";
import { GymMapView } from "@/features/checkin/components/GymMapView";

type MapMode = "body" | "gym";

/** マップタブ: 「部位マップ」と「ジムマップ」を切り替える */
export function MapScreen() {
  const [mode, setMode] = useState<MapMode>("body");

  return (
    <div>
      <PageHeader
        title="マップ"
        subtitle={mode === "body" ? "鍛えたい筋肉をタップ" : "ジムにチェックイン"}
      />

      <div className="mb-5 flex gap-1 rounded-full bg-secondary p-1">
        {(
          [
            ["body", "部位マップ"],
            ["gym", "ジムマップ"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={cn(
              "flex-1 rounded-full py-2 text-sm font-semibold transition-colors",
              mode === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "body" ? <MuscleMapView /> : <GymMapView />}
    </div>
  );
}
