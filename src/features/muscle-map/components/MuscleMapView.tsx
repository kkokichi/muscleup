"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { MuscleCategoryId } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { useExercises } from "@/hooks/useExercises";
import { categoryNameJa } from "@/data/categories";
import { cn } from "@/lib/utils";
import { BodyMapSvg, type BodyView } from "./BodyMapSvg";

export function MuscleMapView() {
  const { exercises } = useExercises();
  const [view, setView] = useState<BodyView>("front");
  const [selected, setSelected] = useState<MuscleCategoryId | null>(null);

  const selectedExercises = useMemo(
    () => (selected ? exercises.filter((e) => e.categoryId === selected) : []),
    [exercises, selected],
  );

  const handleViewChange = (next: BodyView) => {
    setView(next);
    setSelected(null);
  };

  return (
    <div>
      <PageHeader title="部位マップ" subtitle="鍛えたい部位をタップ" />

      <div className="mb-4 flex justify-center gap-1 rounded-full bg-secondary p-1">
        {(["front", "back"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => handleViewChange(v)}
            className={cn(
              "flex-1 rounded-full py-1.5 text-xs font-semibold transition-colors",
              view === v
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            {v === "front" ? "前面" : "背面"}
          </button>
        ))}
      </div>

      <BodyMapSvg view={view} selected={selected} onSelect={setSelected} />

      <AnimatePresence mode="wait">
        {selected && (
          <motion.section
            key={selected}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mt-5"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {categoryNameJa(selected)}の種目
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {selectedExercises.length}件
                </span>
              </h2>
              <Link
                href={`/exercises?category=${selected}`}
                className="flex items-center text-xs font-medium text-primary"
              >
                辞典で見る
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {selectedExercises.map((e) => (
                <Link key={e.id} href={`/exercises/${e.id}`} className="block">
                  <Card className="border-border bg-card transition-colors active:bg-secondary/50">
                    <CardContent className="flex items-center justify-between p-3.5">
                      <div>
                        <p className="text-sm font-semibold">{e.nameJa}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {e.targetMuscles.join("・")}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {!selected && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          イラストの光る部位をタップすると種目一覧が表示されます
        </p>
      )}
    </div>
  );
}
