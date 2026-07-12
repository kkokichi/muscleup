"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Mascot } from "@/features/mascot/components/Mascot";
import {
  type LevelInfo,
  xpUntilNextEvolution,
} from "@/services/levelService";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/utils/date";
import { useMascotEvolutionPersistence } from "../hooks/useMascotEvolutionPersistence";

interface MascotEvolutionCardProps {
  totalXp: number;
  levelInfo: LevelInfo;
}

const STAGE_EMOJI = {
  egg: "🥚",
  rookie: "🏋️",
  power: "💪",
  athlete: "🔥",
  legend: "👑",
} as const;

export function MascotEvolutionCard({
  totalXp,
  levelInfo,
}: MascotEvolutionCardProps) {
  const {
    stage: evolution,
    isNewEvolution,
    history,
  } = useMascotEvolutionPersistence(levelInfo);
  const nextEvolutionXp = xpUntilNextEvolution(totalXp, levelInfo.level);

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold">マッスー進化</p>
            <p className="text-xs text-muted-foreground">
              レベルに合わせて相棒も成長します
            </p>
          </div>
          <Badge variant="secondary">Lv.{levelInfo.level}</Badge>
        </div>

        <div
          className={cn(
            "relative flex items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-br p-4",
            evolution.accentClassName,
          )}
        >
          {isNewEvolution && (
            <motion.div
              className="pointer-events-none absolute inset-0 bg-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.4, ease: "easeOut" }}
            />
          )}
          <div className="relative flex size-24 shrink-0 items-center justify-center rounded-full bg-background/70 ring-1 ring-border">
            <span className="absolute -right-1 -top-1 text-2xl">
              {STAGE_EMOJI[evolution.id]}
            </span>
            <motion.div
              animate={
                isNewEvolution
                  ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <Mascot
                variant={evolution.id}
                mood={levelInfo.level >= 10 ? "cheering" : "happy"}
                size={82}
              />
            </motion.div>
          </div>

          <div className="min-w-0 flex-1">
            {isNewEvolution && (
              <Badge className="mb-2 bg-primary text-primary-foreground">
                進化演出を保存しました
              </Badge>
            )}
            <div className="mb-1 flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" />
              <p className="text-sm font-bold">{evolution.name}</p>
            </div>
            <p className="text-xs font-semibold text-muted-foreground">
              {evolution.title}
            </p>
            <p className="mt-2 text-xs leading-relaxed">{evolution.message}</p>
          </div>
        </div>

        {history.length > 0 && (
          <div className="mt-3 rounded-2xl bg-secondary/60 px-3 py-2">
            <p className="text-[10px] font-semibold text-muted-foreground">
              進化履歴
            </p>
            <p className="mt-0.5 text-xs font-bold">
              {history[0].name} · Lv.{history[0].level} ·{" "}
              {formatDateShort(history[0].evolvedAt)}
            </p>
          </div>
        )}

        <div className="mt-3">
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>次のレベル</span>
            <span className="tabular-nums">
              {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} XP
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(levelInfo.progress * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-primary">
            {nextEvolutionXp === null
              ? "最終進化済み。レジェンド継続中ッス。"
              : `次の進化まであと ${nextEvolutionXp.toLocaleString()} XP`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
