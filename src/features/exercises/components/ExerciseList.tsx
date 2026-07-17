"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Reorder } from "framer-motion";
import { ArrowUpDown, ChevronRight, GripVertical, Plus, Search } from "lucide-react";
import type { Exercise, MuscleCategoryId } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { useExercises } from "@/hooks/useExercises";
import { useExerciseOrderStore } from "@/stores/exerciseOrderStore";
import { EXERCISE_CATEGORIES, categoryNameJa } from "@/data/categories";
import { MUSCLE_CATEGORY_IDS } from "@/types";
import { cn } from "@/lib/utils";
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
  const setOrder = useExerciseOrderStore((s) => s.setOrder);
  // 部位マップからの遷移時（?category=chest 等）に初期フィルタを適用
  const initialCategory = useSearchParams().get("category");
  const [keyword, setKeyword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [reordering, setReordering] = useState(false);
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

  // 表示中のリスト（filtered）の並べ替え結果を、全体の並び順へ反映する
  const handleReorder = (nextFiltered: Exercise[]) => {
    const inView = new Set(filtered.map((e) => e.id));
    let cursor = 0;
    const merged = exercises.map((e) =>
      inView.has(e.id) ? nextFiltered[cursor++].id : e.id,
    );
    setOrder(merged);
  };

  const enterReorder = () => {
    setKeyword("");
    setReordering(true);
  };

  return (
    <div>
      <PageHeader
        title="種目辞典"
        subtitle="正しいフォームを学ぶ"
        action={
          reordering ? (
            <Button size="sm" onClick={() => setReordering(false)}>
              完了
            </Button>
          ) : (
            <div className="flex gap-1.5">
              <Button size="sm" variant="secondary" onClick={enterReorder}>
                <ArrowUpDown className="size-4" data-icon="inline-start" />
                並べ替え
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" data-icon="inline-start" />
                追加
              </Button>
            </div>
          )
        }
      />

      {reordering ? (
        <p className="mb-3 rounded-xl bg-secondary/60 px-3 py-2 text-[11px] text-muted-foreground">
          ドラッグして並べ替え。ここでの順番は種目選択画面にも反映されます
          {category ? `（${categoryNameJa(category)}のみ表示中）` : ""}
        </p>
      ) : (
        <div className="mb-3 flex items-center gap-2 rounded-xl bg-secondary px-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="種目名で検索"
            className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      )}

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
      ) : reordering ? (
        <Reorder.Group axis="y" values={filtered} onReorder={handleReorder} className="space-y-2">
          {filtered.map((e) => (
            <Reorder.Item
              key={e.id}
              value={e}
              className="flex touch-none items-center gap-3 rounded-xl border border-border bg-card p-4 active:cursor-grabbing"
            >
              <GripVertical className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  {e.nameJa}
                  {e.isCustom && <Badge className="text-[9px]">自作</Badge>}
                </p>
                <p className="text-[11px] text-muted-foreground">{e.nameEn}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {categoryNameJa(e.categoryId)}
              </Badge>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="space-y-2">
          {filtered.map((e) => (
            <Link
              key={e.id}
              href={`/exercises/detail?id=${e.id}`}
              className="block"
            >
              <Card className="border-border bg-card transition-colors active:bg-secondary/50">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      {e.nameJa}
                      {e.isCustom && (
                        <Badge className="text-[9px]">自作</Badge>
                      )}
                    </p>
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

      <CustomExerciseSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => reload()}
      />
    </div>
  );
}
