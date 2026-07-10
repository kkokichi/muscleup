"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { Equipment, Exercise, MuscleCategoryId } from "@/types";
import { musclesForCategory } from "@/types";
import { EXERCISE_CATEGORIES } from "@/data/categories";
import { getRepos } from "@/repositories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const EQUIPMENT_OPTIONS: { id: Equipment; label: string }[] = [
  { id: "barbell", label: "バーベル" },
  { id: "dumbbell", label: "ダンベル" },
  { id: "machine", label: "マシン" },
  { id: "cable", label: "ケーブル" },
  { id: "bodyweight", label: "自重" },
];

interface AddExerciseSheetProps {
  open: boolean;
  onClose: () => void;
  /** 保存が成功したら呼ばれる（一覧の再読み込み用） */
  onSaved: (exercise: Exercise) => void;
}

/** 自分だけのオリジナル種目を追加するボトムシートフォーム */
export function AddExerciseSheet({ open, onClose, onSaved }: AddExerciseSheetProps) {
  const [nameJa, setNameJa] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [category, setCategory] = useState<MuscleCategoryId>("chest");
  const [equipment, setEquipment] = useState<Equipment>("barbell");
  const [muscleIds, setMuscleIds] = useState<string[]>([]);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryMuscles = useMemo(
    () => musclesForCategory(category),
    [category],
  );

  const reset = () => {
    setNameJa("");
    setNameEn("");
    setCategory("chest");
    setEquipment("barbell");
    setMuscleIds([]);
    setMemo("");
    setError(null);
  };

  const handleClose = () => {
    if (saving) return;
    reset();
    onClose();
  };

  const toggleMuscle = (id: string) => {
    setMuscleIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    const name = nameJa.trim();
    if (!name) {
      setError("種目名を入力してください");
      return;
    }
    setSaving(true);
    setError(null);

    // 選択した筋肉（未選択ならカテゴリの筋肉すべて）を種目に紐付ける。
    // これで部位マップ・部位フィルタからも検索できるようになる。
    const chosen = categoryMuscles.filter((m) => muscleIds.includes(m.id));
    const muscles = (chosen.length > 0 ? chosen : categoryMuscles).map(
      (m) => m.id,
    );
    const targetMuscles = chosen.map((m) => m.nameJa);
    const howTo = memo
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const exercise: Exercise = {
      id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      categoryId: category,
      nameJa: name,
      nameEn: nameEn.trim(),
      youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        `${name} フォーム`,
      )}`,
      targetMuscles,
      muscles,
      howTo,
      cautions: [],
      beginnerTips: [],
      commonMistakes: [],
      equipment,
      isCustom: true,
    };

    try {
      const repos = await getRepos();
      await repos.exercises.saveCustom(exercise);
      reset();
      onSaved(exercise);
    } catch {
      setError("保存に失敗しました。もう一度お試しください");
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="add-exercise-overlay"
          className="fixed inset-0 z-40 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
      )}
      {open && (
        <motion.div
          key="add-exercise-sheet"
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] max-w-md flex-col rounded-t-3xl border-t border-border bg-popover"
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
              onClick={handleClose}
              className="flex size-8 items-center justify-center rounded-full bg-secondary"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4">
            <div className="space-y-1.5">
              <Label htmlFor="ex-name-ja">
                種目名<span className="text-destructive">*</span>
              </Label>
              <Input
                id="ex-name-ja"
                value={nameJa}
                onChange={(e) => setNameJa(e.target.value)}
                placeholder="例：インクラインカール"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ex-name-en">英語名（任意）</Label>
              <Input
                id="ex-name-en"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="例：Incline Curl"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label>部位</Label>
              <div className="flex flex-wrap gap-1.5">
                {EXERCISE_CATEGORIES.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.nameJa}
                    active={category === c.id}
                    onClick={() => {
                      setCategory(c.id);
                      setMuscleIds([]);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>器具</Label>
              <div className="flex flex-wrap gap-1.5">
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <Chip
                    key={eq.id}
                    label={eq.label}
                    active={equipment === eq.id}
                    onClick={() => setEquipment(eq.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>効かせる筋肉（任意・複数選択可）</Label>
              <div className="flex flex-wrap gap-1.5">
                {categoryMuscles.map((m) => (
                  <Chip
                    key={m.id}
                    label={m.nameJa}
                    active={muscleIds.includes(m.id)}
                    onClick={() => toggleMuscle(m.id)}
                  />
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                未選択の場合はこの部位全体に効く種目として登録されます
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ex-memo">やり方・メモ（任意）</Label>
              <Textarea
                id="ex-memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder={"1行ずつ手順を書くと種目辞典に表示されます\n例：肘を固定して巻き上げる"}
                rows={3}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="border-t border-border bg-muted/40 px-5 py-3">
            <Button
              size="lg"
              className="w-full"
              onClick={handleSave}
              disabled={saving || nameJa.trim() === ""}
            >
              {saving ? "保存中…" : "この種目を追加"}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-foreground",
      )}
    >
      {label}
    </button>
  );
}
