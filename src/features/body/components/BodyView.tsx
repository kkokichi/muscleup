"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { FadeIn } from "@/components/common/FadeIn";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useBodyMetrics } from "../hooks/useBodyMetrics";
import { WeightLogForm } from "./WeightLogForm";
import { WeightTrendChart } from "./WeightTrendChart";
import { ProgressPhotoGallery } from "./ProgressPhotoGallery";

export function BodyView() {
  const mounted = useHasMounted();
  const { metrics, isLoading, addMetric } = useBodyMetrics();

  // metrics は日付降順
  const latest = metrics[0];
  const previous = metrics[1];
  const diff =
    latest && previous
      ? Math.round((latest.weightKg - previous.weightKg) * 10) / 10
      : null;

  if (!mounted || isLoading) {
    return (
      <div>
        <PageHeader title="体組成" subtitle="体重・進捗写真" />
        <div className="h-40 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="体組成" subtitle="体重・進捗写真" />

      <div className="space-y-4">
        {latest && (
          <FadeIn>
            <Card className="border-border bg-card">
              <CardContent className="flex items-center justify-around p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold tabular-nums">
                    {latest.weightKg}
                    <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                      kg
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">最新の体重</p>
                </div>
                {diff !== null && (
                  <div className="text-center">
                    <p
                      className={
                        diff === 0
                          ? "text-2xl font-bold tabular-nums text-muted-foreground"
                          : diff < 0
                            ? "text-2xl font-bold tabular-nums text-primary"
                            : "text-2xl font-bold tabular-nums text-chart-2"
                      }
                    >
                      {diff > 0 ? "+" : ""}
                      {diff}
                      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                        kg
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">前回比</p>
                  </div>
                )}
                {latest.bodyFatPct !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold tabular-nums">
                      {latest.bodyFatPct}
                      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                        %
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">体脂肪率</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )}

        <FadeIn delay={0.05}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <WeightLogForm
                defaultWeight={latest?.weightKg}
                onSubmit={addMetric}
              />
            </CardContent>
          </Card>
        </FadeIn>

        {metrics.length >= 2 && (
          <FadeIn delay={0.1}>
            <Card className="border-border bg-card">
              <CardContent className="p-3 pt-4">
                <p className="mb-2 px-1 text-sm font-semibold">体重の推移</p>
                <WeightTrendChart metrics={metrics} />
              </CardContent>
            </Card>
          </FadeIn>
        )}

        <FadeIn delay={0.15}>
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <ProgressPhotoGallery />
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
