"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Dumbbell, ListOrdered, Play, Trash2, X } from "lucide-react";
import type { Exercise } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRepos } from "@/repositories";
import { categoryNameJa } from "@/data/categories";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";

const EQUIPMENT_LABELS: Record<string, string> = {
  barbell: "バーベル",
  dumbbell: "ダンベル",
  machine: "マシン",
  bodyweight: "自重",
  cable: "ケーブル",
};

interface CustomExerciseSheetProps {
  exercise: Exercise | null;
  onClose: () => void;
  /** 削除後に呼ばれる（一覧の再読み込み用） */
  onDeleted: (id: string) => void;
}

/**
 * カスタム種目の詳細ボトムシート。
 * 静的エクスポート構成のため custom-* は専用ページを持てず、ここで詳細を表示する。
 */
export function CustomExerciseSheet({
  exercise,
  onClose,
  onDeleted,
}: CustomExerciseSheetProps) {
  const router = useRouter();
  const { startWorkout, addExercise } = useWorkoutDraftStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRecord = () => {
    if (!exercise) return;
    startWorkout();
    addExercise(exercise.id);
    router.push("/workout/new");
  };

  const handleDelete = async () => {
    if (!exercise) return;
    const repos = await getRepos();
    await repos.exercises.deleteCustom(exercise.id);
    setConfirmDelete(false);
    onDeleted(exercise.id);
  };

  const handleClose = () => {
    setConfirmDelete(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {exercise && (
        <motion.div
          key="custom-detail-overlay"
          className="fixed inset-0 z-40 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
      )}
      {exercise && (
        <motion.div
          key="custom-detail-sheet"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[85dvh] max-w-md flex-col rounded-t-3xl border-t border-border bg-popover"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
        >
          <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-bold">{exercise.nameJa}</h2>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  カスタム
                </Badge>
              </div>
              {exercise.nameEn && (
                <p className="truncate text-xs text-muted-foreground">
                  {exercise.nameEn}
                </p>
              )}
            </div>
            <button
              type="button"
              aria-label="閉じる"
              onClick={handleClose}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className="text-[10px]">
                {categoryNameJa(exercise.categoryId)}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment}
              </Badge>
              {exercise.targetMuscles.map((m) => (
                <Badge key={m} variant="secondary" className="text-[10px]">
                  {m}
                </Badge>
              ))}
            </div>

            <a
              href={exercise.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3.5 text-sm font-semibold transition-colors active:bg-secondary/50"
            >
              <Play className="size-5 fill-red-500 text-red-500" />
              フォーム動画を検索（YouTube）
            </a>

            {exercise.howTo.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <ListOrdered className="size-4 text-primary" />
                  やり方・メモ
                </p>
                <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
                  {exercise.howTo.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              </div>
            )}

            <Button size="lg" className="w-full" onClick={handleRecord}>
              <Dumbbell className="size-4" data-icon="inline-start" />
              この種目で記録する
            </Button>

            {confirmDelete ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3">
                <p className="mb-2 text-sm">この種目を削除しますか？</p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={handleDelete}
                  >
                    削除する
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setConfirmDelete(false)}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors active:text-destructive"
              >
                <Trash2 className="size-3.5" />
                この種目を削除
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
