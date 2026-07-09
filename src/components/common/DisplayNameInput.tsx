"use client";

import { User } from "lucide-react";

interface DisplayNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

/** コミュニティ投稿の表示名入力（チェックイン・アドバイス共通） */
export function DisplayNameInput({ value, onChange }: DisplayNameInputProps) {
  return (
    <label className="flex items-center gap-2 rounded-xl bg-secondary px-3">
      <User className="size-4 shrink-0 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="表示名"
        maxLength={20}
        className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}
