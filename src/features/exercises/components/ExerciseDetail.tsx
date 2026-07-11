"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Dumbbell,
  Lightbulb,
  ListOrdered,
  Play,
  Trash2,
  XCircle,
} from "lucide-react";
import type { Exercise } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { getRepos } from "@/repositories";
import { categoryNameJa } from "@/data/categories";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";
import { ExerciseAdviceSection } from "./ExerciseAdviceSection";

function Section({
  icon,
  title,
  items,
  ordered = false,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  const List = ordered ? "ol" : "ul";
  if (items.length === 0) return null;
  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-bold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <List
          className={
            ordered
              ? "list-decimal space-y-1.5 pl-5 text-sm leading-relaxed"
              : "list-disc space-y-1.5 pl-5 text-sm leading-relaxed"
          }
        >
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

export function ExerciseDetail({ exerciseId }: { exerciseId: string }) {
  const router = useRouter();
  const { startWorkout, addExercise } = useWorkoutDraftStore();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRepos()
      .then((repos) => repos.exercises.getById(exerciseId))
      .then((e) => {
        if (!cancelled) setExercise(e);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-card" />;
  if (!exercise) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        種目が見つかりませんでした
      </p>
    );
  }

  const handleRecord = () => {
    startWorkout();
    addExercise(exercise.id);
    router.push("/workout/new");
  };

  const handleDelete = async () => {
    const repos = await getRepos();
    await repos.exercises.deleteCustom(exercise.id);
    router.push("/exercises");
  };

  return (
    <div>
      <PageHeader
        title={exercise.nameJa}
        subtitle={exercise.nameEn || "自作の種目"}
        action={
          exercise.isCustom ? (
            confirming ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirming(false)}
                >
                  やめる
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  削除
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="種目を削除"
                onClick={() => setConfirming(true)}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            )
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <Badge className="text-[10px]">{categoryNameJa(exercise.categoryId)}</Badge>
        {exercise.targetMuscles.map((m) => (
          <Badge key={m} variant="secondary" className="text-[10px]">
            {m}
          </Badge>
        ))}
      </div>

      <div className="space-y-3">
        <a
          href={exercise.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-semibold transition-colors active:bg-secondary/50"
        >
          <Play className="size-5 fill-red-500 text-red-500" />
          フォーム動画を見る（YouTube）
        </a>

        <Section
          icon={<ListOrdered className="size-4 text-primary" />}
          title="やり方"
          items={exercise.howTo}
          ordered
        />
        <Section
          icon={<AlertTriangle className="size-4 text-orange-400" />}
          title="注意点"
          items={exercise.cautions}
        />
        <Section
          icon={<Lightbulb className="size-4 text-yellow-400" />}
          title="初心者向けポイント"
          items={exercise.beginnerTips}
        />
        <Section
          icon={<XCircle className="size-4 text-destructive" />}
          title="よくある失敗"
          items={exercise.commonMistakes}
        />

        <ExerciseAdviceSection exerciseId={exercise.id} />

        <Button size="lg" className="w-full" onClick={handleRecord}>
          <Dumbbell className="size-4" data-icon="inline-start" />
          この種目で記録する
        </Button>
      </div>
    </div>
  );
}
