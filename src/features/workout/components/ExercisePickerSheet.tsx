"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, X } from "lucide-react";
import type { Exercise, MuscleCategoryId } from "@/types";
import { EXERCISE_CATEGORIES } from "@/data/categories";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CustomExerciseSheet } from "@/features/exercises/components/CustomExerciseSheet";

interface ExercisePickerSheetProps {
  open: boolean;
  exercises: Exercise[];
  /** 最近使った順の種目ID（上位に表示） */
  recentIds: string[];
  /** すでに追加済みの種目ID（非表示にする） */
  excludeIds: string[];
  /** 部位ごとの「何日何時間前」ラベル */
  categoryElapsed?: Record<string, string>;
  onSelect: (exercise: Exercise) => void;
  onCustomExerciseCreated?: (exercise: Exercise) => void | Promise<void>;
  onClose: () => void;
}

/** 種目選択のボトムシート。検索 + 部位フィルタ（最終実施からの経過つき）+ 最近使った順 */
export function ExercisePickerSheet({
  open,
  exercises,
  recentIds,
  excludeIds,
  categoryElapsed,
  onSelect,
  onCustomExerciseCreated,
  onClose,
}: ExercisePickerSheetProps) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<MuscleCategoryId | null>(null);
  const [customOpen, setCustomOpen] = useState(false);

  const filtered = useMemo(() => {
    const rank = new Map(recentIds.map((id, i) => [id, i]));
    const excluded = new Set(excludeIds);
    const kw = keyword.trim().toLowerCase();
    return exercises
      .filter((e) => !excluded.has(e.id))
      .filter((e) => (category ? e.categoryId === category : true))
      .filter(
        (e) =>
          kw === "" ||
          e.nameJa.toLowerCase().includes(kw) ||
          e.nameEn.toLowerCase().includes(kw),
      )
      .sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
  }, [exercises, recentIds, excludeIds, keyword, category]);

  return (
    <AnimatePresence>
      {/* AnimatePresence直下はFragment不可（アンマウントされなくなる）。keyed siblingsにする */}
      {open && (
        <motion.div
          key="picker-overlay"
          className="fixed inset-0 z-40 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key="picker-sheet"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[80dvh] max-w-md flex-col rounded-t-3xl border-t border-border bg-popover"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
          >
            <div className="flex items-center justify-between px-5 pb-2 pt-4">
              <h2 className="text-lg font-bold">種目を選ぶ</h2>
              <button
                type="button"
                aria-label="閉じる"
                onClick={onClose}
                className="flex size-8 items-center justify-center rounded-full bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 rounded-xl bg-secondary px-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="種目名で検索"
                  className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                <CategoryChip
                  label="すべて"
                  active={category === null}
                  onClick={() => setCategory(null)}
                />
                {EXERCISE_CATEGORIES.map((c) => (
                  <CategoryChip
                    key={c.id}
                    label={c.nameJa}
                    elapsed={categoryElapsed?.[c.id] ?? "未実施"}
                    active={category === c.id}
                    onClick={() => setCategory(c.id)}
                  />
                ))}
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="mt-3 w-full"
                onClick={() => setCustomOpen(true)}
              >
                <Plus className="size-4" data-icon="inline-start" />
                種目を新規追加
              </Button>
            </div>

            <ul className="flex-1 overflow-y-auto px-3 pb-8">
              {filtered.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(e)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left transition-colors active:bg-secondary"
                  >
                    <div>
                      <p className="text-sm font-semibold">{e.nameJa}</p>
                      <p className="text-[11px] text-muted-foreground">{e.nameEn}</p>
                    </div>
                    {recentIds.includes(e.id) && (
                      <span className="text-[10px] font-medium text-primary">
                        最近
                      </span>
                    )}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    該当する種目がありません
                  </p>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="mt-3"
                    onClick={() => setCustomOpen(true)}
                  >
                    <Plus className="size-4" data-icon="inline-start" />
                    この種目を追加
                  </Button>
                </div>
              )}
            </ul>
            <CustomExerciseSheet
              open={customOpen}
              onClose={() => setCustomOpen(false)}
              onCreated={async (exercise) => {
                await onCustomExerciseCreated?.(exercise);
                onSelect(exercise);
                onClose();
              }}
            />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CategoryChip({
  label,
  elapsed,
  active,
  onClick,
}: {
  label: string;
  elapsed?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 flex-col items-center rounded-2xl px-3.5 py-1.5 transition-colors",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
      )}
    >
      <span className="text-xs font-semibold">{label}</span>
      {elapsed && (
        <span
          className={cn(
            "text-[9px]",
            active ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {elapsed}
        </span>
      )}
    </button>
  );
}
