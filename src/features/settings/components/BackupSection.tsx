"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  createBackupFile,
  downloadBackupFile,
  parseBackupFile,
  restoreBackup,
  summarizeBackup,
} from "@/lib/backup";
import { useExerciseOrderStore } from "@/stores/exerciseOrderStore";
import { useRestTimerStore } from "@/stores/restTimerStore";
import { useThemeStore } from "@/stores/themeStore";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";

type Notice = { kind: "success" | "error"; text: string } | null;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "処理に失敗しました";
}

/** 機種変更・Safari/iOSアプリ間の移行に使う端末バックアップ。 */
export function BackupSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const handleExport = async () => {
    setBusy("export");
    setNotice(null);
    try {
      const file = await createBackupFile();
      downloadBackupFile(file);
      setNotice({
        kind: "success",
        text: "バックアップを書き出しました。iCloud Driveなどに保管してください。",
      });
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(null);
    }
  };

  const handleImport = async (file: File) => {
    setBusy("import");
    setNotice(null);
    try {
      const backup = await parseBackupFile(file);
      const summary = summarizeBackup(backup);
      const confirmed = window.confirm(
        `現在の端末データをバックアップの内容に置き換えます。\n\n` +
          `トレーニング記録: ${summary.workoutCount}件\n` +
          `進捗写真: ${summary.photoCount}枚\n\n` +
          `よろしいですか？`,
      );
      if (!confirmed) return;

      await restoreBackup(backup);
      await Promise.all([
        useWorkoutDraftStore.persist.rehydrate(),
        useThemeStore.persist.rehydrate(),
        useRestTimerStore.persist.rehydrate(),
        useExerciseOrderStore.persist.rehydrate(),
      ]);
      router.replace("/");
    } catch (error) {
      setNotice({ kind: "error", text: errorMessage(error) });
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="space-y-3 p-4">
        <div>
          <p className="text-sm font-semibold">バックアップ・移行</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            記録・設定・身体データ・進捗写真を1つのファイルに保存し、
            新しい端末やiOSアプリで読み込めます。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={busy !== null}
            onClick={handleExport}
          >
            <Download className="size-4" data-icon="inline-start" />
            {busy === "export" ? "作成中…" : "書き出す"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" data-icon="inline-start" />
            {busy === "import" ? "読込中…" : "読み込む"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="MuscleUpバックアップを選択"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImport(file);
            }}
          />
        </div>

        {notice && (
          <p
            role="status"
            className={
              notice.kind === "error"
                ? "text-[11px] text-destructive"
                : "text-[11px] text-primary"
            }
          >
            {notice.text}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
