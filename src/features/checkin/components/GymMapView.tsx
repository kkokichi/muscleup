"use client";

import { useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import type { CheckinDraft } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useUserName } from "@/hooks/useUserName";
import { DEFAULT_MAP_CENTER, isMapsConfigured } from "@/lib/maps";
import { Mascot } from "@/features/mascot/components/Mascot";
import { useMascotStore } from "@/stores/mascotStore";
import { useCheckins } from "../hooks/useCheckins";
import { CheckinMapCanvas } from "./CheckinMapCanvas";
import { CheckinComposer } from "./CheckinComposer";
import { CheckinCard } from "./CheckinCard";

/** ジムマップ: チェックインを地図（またはリスト）で表示し、新規チェックインできる */
export function GymMapView() {
  const mounted = useHasMounted();
  const { checkins, isLoading, addCheckin } = useCheckins();
  const { name, saveName } = useUserName();
  const speak = useMascotStore((s) => s.speak);
  const [composerOpen, setComposerOpen] = useState(false);
  const mapsOn = isMapsConfigured();

  const center = useMemo(
    () =>
      checkins.length > 0
        ? { lat: checkins[0].lat, lng: checkins[0].lng }
        : DEFAULT_MAP_CENTER,
    [checkins],
  );

  const handleSubmit = async (draft: CheckinDraft, authorName: string) => {
    await saveName(authorName);
    await addCheckin(draft, authorName);
    speak("workoutSaved");
  };

  return (
    <div>
      {mounted && mapsOn ? (
        <CheckinMapCanvas checkins={checkins} center={center} height={300} />
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-3 p-4">
            <MapPin className="size-5 shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              地図（Google Maps）は未設定です。チェックインはリストで表示されます。
              APIキーを設定すると地図にピンとコメントが並びます。
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        size="lg"
        className="mt-4 w-full"
        onClick={() => setComposerOpen(true)}
      >
        <Plus className="size-4" data-icon="inline-start" />
        ジムにチェックイン
      </Button>

      <section className="mt-5">
        <h2 className="mb-2 text-sm font-bold">最近のチェックイン</h2>
        {!mounted || isLoading ? (
          <div className="h-20 animate-pulse rounded-2xl bg-card" />
        ) : checkins.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center gap-2 p-8 text-center">
              <Mascot mood="happy" size={80} />
              <p className="text-sm font-semibold">まだチェックインがないッス</p>
              <p className="text-xs text-muted-foreground">
                ジムに着いたら最初のチェックインをしよう！
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {checkins.map((c) => (
              <CheckinCard key={c.id} checkin={c} />
            ))}
          </div>
        )}
      </section>

      <CheckinComposer
        open={composerOpen}
        initialName={name}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
