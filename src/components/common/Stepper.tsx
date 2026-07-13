"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

interface StepperProps {
  label: string;
  value: number;
  step: number;
  min?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

/**
 * ワンタップ調整の数値ステッパー。
 * 中央の数値をタップすると直接入力にフォールバックする。
 */
export function Stepper({
  label,
  value,
  step,
  min = 0,
  suffix,
  onChange,
}: StepperProps) {
  // text は編集中のみ使用。非編集時は常に props の value を表示する
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const beginEdit = () => {
    setText(String(value));
    setIsEditing(true);
  };

  const commit = () => {
    const parsed = Number.parseFloat(text);
    onChange(Number.isFinite(parsed) ? Math.max(min, parsed) : value);
    setIsEditing(false);
  };

  const nudge = (dir: 1 | -1) => {
    // 浮動小数の誤差を丸める（2.5刻み対応）
    const next = Math.max(min, Math.round((value + dir * step) * 100) / 100);
    onChange(next);
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
      <div className="flex w-full items-center justify-center gap-1">
        <button
          type="button"
          aria-label={`${label}を減らす`}
          onClick={() => nudge(-1)}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-90"
        >
          <Minus className="size-4" />
        </button>
        {isEditing ? (
          <input
            autoFocus
            inputMode="decimal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && commit()}
            className="w-12 rounded-md bg-secondary px-1 py-0.5 text-center text-base font-bold tabular-nums outline-none ring-2 ring-ring"
          />
        ) : (
          <button
            type="button"
            onClick={beginEdit}
            className="min-w-11 text-center text-base font-bold tabular-nums"
          >
            {value}
            {suffix && (
              <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">
                {suffix}
              </span>
            )}
          </button>
        )}
        <button
          type="button"
          aria-label={`${label}を増やす`}
          onClick={() => nudge(1)}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition-transform active:scale-90"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
