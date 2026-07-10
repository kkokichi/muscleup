"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { todayISO } from "@/utils/date";
import type { BodyMetricInput } from "../hooks/useBodyMetrics";

interface WeightLogFormProps {
  defaultWeight?: number;
  onSubmit: (input: BodyMetricInput) => Promise<void>;
}

/** 体重・体脂肪率の入力フォーム */
export function WeightLogForm({ defaultWeight, onSubmit }: WeightLogFormProps) {
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState(defaultWeight ? String(defaultWeight) : "");
  const [bodyFat, setBodyFat] = useState("");
  const [saving, setSaving] = useState(false);

  const weightNum = Number.parseFloat(weight);
  const canSubmit = Number.isFinite(weightNum) && weightNum > 0 && !saving;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const bf = Number.parseFloat(bodyFat);
      await onSubmit({
        date,
        weightKg: Math.round(weightNum * 10) / 10,
        ...(Number.isFinite(bf) && bf > 0 ? { bodyFatPct: bf } : {}),
      });
      setBodyFat("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">日付</span>
          <input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="flex w-24 flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">体重(kg)</span>
          <input
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="65.0"
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="flex w-24 flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">体脂肪(%)</span>
          <input
            inputMode="decimal"
            value={bodyFat}
            onChange={(e) => setBodyFat(e.target.value)}
            placeholder="任意"
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>
      <Button className="w-full" disabled={!canSubmit} onClick={submit}>
        {saving ? "記録中…" : "体重を記録"}
      </Button>
    </div>
  );
}
