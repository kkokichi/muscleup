"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import type { MuscleCategoryId } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { useExercises } from "@/hooks/useExercises";
import { EXERCISE_CATEGORIES, categoryNameJa } from "@/data/categories";
import { MUSCLE_CATEGORY_IDS } from "@/types";
import { cn } from "@/lib/utils";

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "バーベル",
  dumbbell: "ダンベル",
  machine: "マシン",
  bodyweight: "自重",
  cable: "ケーブル",
};

export function ExerciseList() {
  const { exercises, isLoading } = useExercises();
  // 部位マップからの遷移時（?category=chest 等）に初期フィルタを適用
  const initialCategory = useSearchParams().get("category");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<MuscleCategoryId | null>(
    MUSCLE_CATEGORY_IDS.includes(initialCategory as MuscleCategoryId)
      ? (initialCategory as MuscleCategoryId)
      : null,
  );

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return exercises
      .filter((e) => (category ? e.categoryId === category : true))
      .filter(
        (e) =>
          kw === "" ||
          e.nameJa.toLowerCase().includes(kw) ||
          e.nameEn.toLowerCase().includes(kw),
      );
  }, [exercises, keyword, category]);

  return (
    <div>
      <PageHeader title="種目辞典" subtitle="正しいフォームを学ぶ" />

      <div className="mb-3 flex items-center gap-2 rounded-xl bg-secondary px-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="種目名で検索"
          className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory(null)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            category === null
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-foreground",
          )}
        >
          すべて
        </button>
        {EXERCISE_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
              category === c.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground",
            )}
          >
            {c.nameJa}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-card" />
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <Link key={e.id} href={`/exercises/${e.id}`} className="block">
              <Card className="border-border bg-card transition-colors active:bg-secondary/50">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{e.nameJa}</p>
                    <p className="text-[11px] text-muted-foreground">{e.nameEn}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {categoryNameJa(e.categoryId)}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {EQUIPMENT_LABELS[e.equipment] ?? e.equipment}
                    </Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              該当する種目がありません
            </p>
          )}
        </div>
      )}
    </div>
  );
}
