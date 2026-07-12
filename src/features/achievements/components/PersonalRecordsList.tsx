"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import type { Exercise, ExerciseRecord, MuscleCategoryId } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EXERCISE_CATEGORIES, categoryNameJa } from "@/data/categories";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/utils/date";
import { formatVolume } from "@/services/statsService";

interface PersonalRecordsListProps {
  records: ExerciseRecord[];
  exerciseById: Map<string, Exercise>;
}

type CategoryFilter = "all" | MuscleCategoryId;

export function PersonalRecordsList({
  records,
  exerciseById,
}: PersonalRecordsListProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");

  const filteredRecords = useMemo(() => {
    return records
      .filter((record) => {
        if (category === "all") return true;
        return exerciseById.get(record.exerciseId)?.categoryId === category;
      })
      .sort(
        (a, b) =>
          b.achievedAt.localeCompare(a.achievedAt) ||
          (b.updatedCount - a.updatedCount),
      );
  }, [category, exerciseById, records]);

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold">ベスト更新詳細</p>
          <p className="text-xs text-muted-foreground">
            種目ごとの最高値と更新日を確認できます
          </p>
        </div>
        <Badge variant="secondary">{records.length}種目</Badge>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <CategoryChip
          label="すべて"
          active={category === "all"}
          onClick={() => setCategory("all")}
        />
        {EXERCISE_CATEGORIES.map((item) => (
          <CategoryChip
            key={item.id}
            label={item.nameJa}
            active={category === item.id}
            onClick={() => setCategory(item.id)}
          />
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-3 p-7 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Trophy className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold">まだベスト記録がありません</p>
              <p className="mt-1 text-xs text-muted-foreground">
                ワークアウトを記録すると、最高重量・1RM・回数・ボリュームがここに残ります。
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const exercise = exerciseById.get(record.exerciseId);
            return (
              <Card key={record.exerciseId} className="border-border bg-card">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">
                        {exercise?.nameJa ?? record.exerciseId}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {exercise ? categoryNameJa(exercise.categoryId) : "未分類"}
                      </p>
                    </div>
                    <Badge variant="outline">
                      {record.updatedCount}回更新
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <RecordMetric label="最高重量" value={`${record.maxWeight}kg`} />
                    <RecordMetric
                      label="推定1RM"
                      value={`${Math.round(record.est1rm * 10) / 10}kg`}
                    />
                    <RecordMetric label="最大回数" value={`${record.maxReps}回`} />
                    <RecordMetric
                      label="最大ボリューム"
                      value={formatVolume(record.maxVolume)}
                    />
                  </div>

                  <div className="rounded-xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
                    最終更新日{" "}
                    <span className="font-semibold text-foreground">
                      {formatDateShort(record.achievedAt)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CategoryChip({
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
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function RecordMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 px-3 py-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}
