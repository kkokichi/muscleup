"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight, Plus, Search } from "lucide-react";
import type { Exercise, MuscleCategoryId } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { useExercises } from "@/hooks/useExercises";
import { EXERCISE_CATEGORIES, categoryNameJa } from "@/data/categories";
import { MUSCLE_CATEGORY_IDS } from "@/types";
import { cn } from "@/lib/utils";
import { AddExerciseSheet } from "./AddExerciseSheet";
import { CustomExerciseSheet } from "./CustomExerciseSheet";

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "バーベル",
  dumbbell: "ダンベル",
  machine: "マシン",
  bodyweight: "自重",
  cable: "ケーブル",
};

export function ExerciseList() {
  const { exercises, isLoading, reload } = useExercises();
  // 部位マップからの遷移時（?category=chest 等）に初期フィルタを適用
  const initialCategory = useSearchParams().get("category");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<MuscleCategoryId | null>(
    MUSCLE_CATEGORY_IDS.includes(initialCategory as MuscleCategoryId)
      ? (initialCategory as MuscleCategoryId)
      : null,
  );
  const [addOpen, setAddOpen] = useState(false);
  const [selectedCustom, setSelectedCustom] = useState<Exercise | null>(null);

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

      <div className="mb-4 flex items-center gap-2">
        <div className="flex flex-1 gap-1.5 overflow-x-auto pb-1">
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
        <Button
          size="sm"
          variant="secondary"
          className="shrink-0"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-3.5" data-icon="inline-start" />
          追加
        </Button>
      </div>

      {isLoading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-card" />
      ) : (
        <div className="space-y-2">
          {filtered.map((e) =>
            e.isCustom ? (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedCustom(e)}
                className="block w-full text-left"
              >
                <ExerciseRow exercise={e} />
              </button>
            ) : (
              <Link key={e.id} href={`/exercises/${e.id}`} className="block">
                <ExerciseRow exercise={e} />
              </Link>
            ),
          )}
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              該当する種目がありません
            </p>
          )}
        </div>
      )}

      <AddExerciseSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={async (created) => {
          setAddOpen(false);
          await reload();
          setSelectedCustom(created);
        }}
      />

      <CustomExerciseSheet
        exercise={selectedCustom}
        onClose={() => setSelectedCustom(null)}
        onDeleted={async () => {
          setSelectedCustom(null);
          await reload();
        }}
      />
    </div>
  );
}

function ExerciseRow({ exercise: e }: { exercise: Exercise }) {
  return (
    <Card className="border-border bg-card transition-colors active:bg-secondary/50">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold">{e.nameJa}</p>
            {e.isCustom && (
              <Badge variant="outline" className="shrink-0 text-[9px]">
                カスタム
              </Badge>
            )}
          </div>
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
  );
}
