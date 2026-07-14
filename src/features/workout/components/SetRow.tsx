"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { DraftSet } from "@/types";
import { Stepper } from "@/components/common/Stepper";
import { cn } from "@/lib/utils";

const RPE_OPTIONS = ["", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"];

interface SetRowProps {
  index: number;
  set: DraftSet;
  onUpdate: (patch: Partial<DraftSet>) => void;
  onToggleDone: () => void;
  onRemove: () => void;
}

export function SetRow({ index, set, onUpdate, onToggleDone, onRemove }: SetRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl px-1 py-2 transition-colors",
        set.isDone && "bg-primary/5",
      )}
    >
      <span className="w-3.5 shrink-0 text-center text-xs font-bold text-muted-foreground tabular-nums">
        {index + 1}
      </span>

      <Stepper
        label="重量kg"
        value={set.weightKg}
        step={2.5}
        onChange={(weightKg) => onUpdate({ weightKg })}
      />
      <Stepper
        label="回数"
        value={set.reps}
        step={1}
        onChange={(reps) => onUpdate({ reps: Math.round(reps) })}
      />

      <div className="flex shrink-0 flex-col items-center gap-1">
        <span className="text-[10px] font-medium text-muted-foreground">RPE</span>
        <select
          aria-label="RPE"
          value={set.rpe !== undefined ? String(set.rpe) : ""}
          onChange={(e) =>
            onUpdate({
              rpe: e.target.value === "" ? undefined : Number(e.target.value),
            })
          }
          className="h-8 w-10 rounded-md bg-secondary text-center text-sm font-semibold tabular-nums outline-none"
        >
          {RPE_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v === "" ? "-" : v}
            </option>
          ))}
        </select>
      </div>

      <motion.button
        type="button"
        aria-label={set.isDone ? "セット完了を解除" : "セット完了"}
        onClick={onToggleDone}
        whileTap={{ scale: 0.8 }}
        animate={set.isDone ? { scale: [1, 1.25, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
          set.isDone
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground",
        )}
      >
        <Check className="size-3.5" strokeWidth={3} />
      </motion.button>

      <button
        type="button"
        aria-label="セットを削除"
        onClick={onRemove}
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
