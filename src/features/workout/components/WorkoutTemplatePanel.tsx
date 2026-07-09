"use client";

import { Save, Trash2, Zap } from "lucide-react";
import type { WorkoutDraft, WorkoutLog, WorkoutTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWorkoutDraftStore } from "@/stores/workoutDraftStore";
import { createTemplateFromDraft } from "@/services/templateService";
import { useWorkoutTemplates } from "../hooks/useWorkoutTemplates";

interface WorkoutTemplatePanelProps {
  draft: WorkoutDraft;
  latestLog: WorkoutLog | undefined;
}

function summarizeTemplate(template: WorkoutTemplate): string {
  const setCount = template.entries.reduce((sum, entry) => sum + entry.sets.length, 0);
  return `${template.entries.length}種目 · ${setCount}セット`;
}

export function WorkoutTemplatePanel({ draft, latestLog }: WorkoutTemplatePanelProps) {
  const { templates, saveTemplate, markUsed, deleteTemplate } = useWorkoutTemplates();
  const { startFromLog, startFromTemplate } = useWorkoutDraftStore();
  const hasDraftEntries = draft.entries.length > 0;

  const handleStartPrevious = () => {
    if (!latestLog) return;
    if (hasDraftEntries && !window.confirm("現在の下書きを前回メニューで置き換えますか？")) {
      return;
    }
    startFromLog(latestLog);
  };

  const handleStartTemplate = async (template: WorkoutTemplate) => {
    if (hasDraftEntries && !window.confirm("現在の下書きをテンプレートで置き換えますか？")) {
      return;
    }
    startFromTemplate(template);
    await markUsed(template);
  };

  const handleSaveTemplate = async () => {
    const defaultName = latestLog ? "いつものメニュー" : "新しいメニュー";
    const name = window.prompt("テンプレート名", defaultName);
    if (name === null) return;
    const template = createTemplateFromDraft(draft, name);
    if (!template) return;
    await saveTemplate(template);
  };

  return (
    <Card className="mb-4 border-border bg-card">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">クイック開始</p>
            <p className="text-xs text-muted-foreground">迷わず始めるための固定メニュー</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={!hasDraftEntries}
            onClick={handleSaveTemplate}
          >
            <Save className="size-4" data-icon="inline-start" />
            保存
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {latestLog && (
            <Button
              variant="default"
              className="shrink-0"
              onClick={handleStartPrevious}
            >
              <Zap className="size-4" data-icon="inline-start" />
              前回メニュー
            </Button>
          )}
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex min-w-44 shrink-0 items-center justify-between gap-2 rounded-lg border border-border bg-secondary px-3 py-2"
            >
              <button
                type="button"
                className="min-w-0 text-left"
                onClick={() => handleStartTemplate(template)}
              >
                <span className="block truncate text-sm font-bold">{template.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {summarizeTemplate(template)}
                </span>
              </button>
              <button
                type="button"
                aria-label={`${template.name}を削除`}
                onClick={() => deleteTemplate(template.id)}
                className="text-muted-foreground/70 transition-colors hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {!latestLog && templates.length === 0 && (
            <p className="py-2 text-xs text-muted-foreground">
              最初の記録後、前回メニューを1タップで開始できます。
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
