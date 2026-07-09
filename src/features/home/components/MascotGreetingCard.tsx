"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { pickMascotMessage } from "@/services/mascotService";
import { Mascot } from "@/features/mascot/components/Mascot";
import { MascotBubble } from "@/features/mascot/components/MascotBubble";
import type { MascotContext } from "@/types";

interface MascotGreetingCardProps {
  streak: number;
  trainedToday: boolean;
  weeklyCount: number;
}

function decideContext(props: MascotGreetingCardProps): MascotContext {
  if (props.trainedToday && props.streak >= 2) return "streak";
  if (!props.trainedToday && props.weeklyCount >= 4) return "restDay";
  return "greeting";
}

/** ホーム最上部: マスコットの今日のひとこと */
export function MascotGreetingCard(props: MascotGreetingCardProps) {
  // 初回レンダリング時に1度だけ選ぶ（再レンダリングで文言が変わらないように）
  const [message] = useState(() =>
    pickMascotMessage(decideContext(props), { streak: props.streak }),
  );

  return (
    <Card className="border-border bg-gradient-to-br from-card to-secondary/40">
      <CardContent className="flex items-center gap-3 p-4">
        <Mascot mood={props.trainedToday ? "excited" : "happy"} size={84} />
        <div className="flex-1">
          <MascotBubble text={message.text} />
        </div>
      </CardContent>
    </Card>
  );
}
