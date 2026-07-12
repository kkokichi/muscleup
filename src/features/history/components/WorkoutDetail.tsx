"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { WorkoutLog } from "@/types";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/PageHeader";
import { getRepos } from "@/repositories";
import { rebuildRecordsFromLogs } from "@/services/recordService";
import { formatDateJa } from "@/utils/date";
import { WorkoutLogEditor } from "./WorkoutLogEditor";
import { WorkoutSetsDetail } from "./WorkoutSetsDetail";

export function WorkoutDetail({ logId }: { logId: string }) {
  const router = useRouter();
  const [log, setLog] = useState<WorkoutLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.workoutLogs.getById(logId))
      .then((l) => {
        if (!cancelled) setLog(l);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [logId]);

  const handleDelete = async () => {
    const repos = await getRepos();
    await repos.workoutLogs.delete(logId);
    const logs = await repos.workoutLogs.getAll();
    const existingRecords = await repos.records.getAll();
    await repos.records.replaceAll(rebuildRecordsFromLogs(logs, existingRecords));
    router.push("/history");
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-card" />;
  }
  if (!log) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        記録が見つかりませんでした
      </p>
    );
  }

  if (isEditing) {
    return (
      <div>
        <PageHeader title={formatDateJa(log.date)} subtitle="記録を編集" />
        <WorkoutLogEditor
          log={log}
          onCancel={() => setIsEditing(false)}
          onSaved={(nextLog) => {
            setLog(nextLog);
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={formatDateJa(log.date)}
        subtitle="ワークアウト詳細"
        action={
          confirming ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
                やめる
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                削除する
              </Button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="記録を編集"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="この記録を削除"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          )
        }
      />

      <WorkoutSetsDetail log={log} />
    </div>
  );
}
