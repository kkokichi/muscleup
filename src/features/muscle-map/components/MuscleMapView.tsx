"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { MuscleId } from "@/types";
import { getMuscle, muscleNameJa } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useExercises } from "@/hooks/useExercises";
import { cn } from "@/lib/utils";
import { BodyMapSvg, type BodyView } from "./BodyMapSvg";

export function MuscleMapView() {
  const { exercises } = useExercises();
  const [view, setView] = useState<BodyView>("front");
  const [selected, setSelected] = useState<MuscleId | null>(null);

  /** 選択筋肉を主働筋にする種目を先頭に、補助的に効く種目を後ろに並べる */
  const matched = useMemo(() => {
    if (!selected) return [];
    return exercises
      .filter((e) => e.muscles.includes(selected))
      .sort(
        (a, b) => a.muscles.indexOf(selected) - b.muscles.indexOf(selected),
      );
  }, [exercises, selected]);

  const handleViewChange = (next: BodyView) => {
    setView(next);
    setSelected(null);
  };

  const selectedCategory = selected ? getMuscle(selected)?.categoryId : null;

  return (
    <div>
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
        {selected ? (
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
                {muscleNameJa(selected)}の種目
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {matched.length}件
                </span>
              </h2>
              {selectedCategory && (
                <Link
                  href={`/exercises?category=${selectedCategory}`}
                  className="flex items-center text-xs font-medium text-primary"
                >
                  辞典で見る
                  <ChevronRight className="size-3.5" />
                </Link>
              )}
            </div>
            <div className="space-y-2">
              {matched.map((e) => (
                <Link
                  key={e.id}
                  href={`/exercises/detail?id=${e.id}`}
                  className="block"
                >
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
              {matched.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  この筋肉の種目はまだ登録されていません
                </p>
              )}
            </div>
          </motion.section>
        ) : (
          <p className="mt-5 text-center text-xs text-muted-foreground">
            イラストの筋肉をタップすると種目一覧が表示されます
          </p>
        )}
      </AnimatePresence>
    </div>
  );
}
