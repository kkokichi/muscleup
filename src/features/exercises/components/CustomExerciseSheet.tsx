"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Equipment, Exercise, MuscleCategoryId, MuscleId } from "@/types";
import { musclesForCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { EXERCISE_CATEGORIES } from "@/data/categories";
import { getRepos } from "@/repositories";
import { createId } from "@/utils/id";
import { cn } from "@/lib/utils";

const EQUIPMENTS: { value: Equipment; label: string }[] = [
  { value: "barbell", label: "バーベル" },
  { value: "dumbbell", label: "ダンベル" },
  { value: "machine", label: "マシン" },
  { value: "cable", label: "ケーブル" },
  { value: "bodyweight", label: "自重" },
];

interface CustomExerciseSheetProps {
  open: boolean;
  onClose: () => void;
  onCreated: (exercise: Exercise) => void;
}

/** 自作の種目を分類ごとに追加するシート */
export function CustomExerciseSheet({
  open,
  onClose,
  onCreated,
}: CustomExerciseSheetProps) {
  const [nameJa, setNameJa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState<MuscleCategoryId>("chest");
  const [equipment, setEquipment] = useState<Equipment>("barbell");
  const [muscles, setMuscles] = useState<MuscleId[]>([]);
  const [saving, setSaving] = useState(false);

  const categoryMuscles = musclesForCategory(category);
  const canSubmit = nameJa.trim().length > 0 && !saving;

  const reset = () => {
    setNameJa("");
    setNameEn("");
    setCategory("chest");
    setEquipment("barbell");
    setMuscles([]);
  };

  const toggleMuscle = (id: MuscleId) => {
    setMuscles((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleCategoryChange = (next: MuscleCategoryId) => {
    setCategory(next);
    setMuscles([]); // 部位が変わったら筋肉選択をリセット
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const name = nameJa.trim();
      const exercise: Exercise = {
        id: `custom-${createId()}`,
        categoryId: category,
        nameJa: name,
        nameEn: nameEn.trim(),
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
          `${name} フォーム`,
        )}`,
        targetMuscles: muscles.length
          ? muscles.map((m) => categoryMuscles.find((cm) => cm.id === m)?.nameJa ?? m)
          : [],
        muscles,
        howTo: [],
        cautions: [],
        beginnerTips: [],
        commonMistakes: [],
        equipment,
        isCustom: true,
      };
      const repos = await getRepos();
      await repos.exercises.saveCustom(exercise);
      reset();
      onCreated(exercise);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="custom-overlay"
          className="fixed inset-0 z-50 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
      )}
      {open && (
        <motion.div
          key="custom-sheet"
          className="fixed inset-x-0 bottom-0 z-[60] mx-auto flex max-h-[88dvh] max-w-md flex-col overflow-y-auto rounded-t-3xl border-t border-border bg-popover"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-4">
            <h2 className="text-lg font-bold">種目を追加</h2>
            <button
              type="button"
              aria-label="閉じる"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-4 px-5 pb-8">
            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">種目名（必須）</span>
              <input
                value={nameJa}
                onChange={(e) => setNameJa(e.target.value)}
                placeholder="例: インクラインベンチプレス"
                maxLength={40}
                className="h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">
                英語名（任意）
              </span>
              <input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="例: Incline Bench Press"
                maxLength={40}
                className="h-11 rounded-xl border border-border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </label>

            <div>
              <p className="mb-1.5 text-[11px] text-muted-foreground">分類（部位）</p>
              <div className="flex flex-wrap gap-1.5">
                {EXERCISE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCategoryChange(c.id)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      category === c.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground",
                    )}
                  >
                    {c.nameJa}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] text-muted-foreground">器具</p>
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENTS.map((eq) => (
                  <button
                    key={eq.value}
                    type="button"
                    onClick={() => setEquipment(eq.value)}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                      equipment === eq.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground",
                    )}
                  >
                    {eq.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[11px] text-muted-foreground">
                効く筋肉（任意・部位マップに反映）
              </p>
              <div className="flex flex-wrap gap-1.5">
                {categoryMuscles.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleMuscle(m.id)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      muscles.includes(m.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {m.nameJa}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!canSubmit}
              onClick={submit}
            >
              {saving ? "追加中…" : "この種目を追加"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
