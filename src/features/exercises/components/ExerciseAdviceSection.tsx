"use client";

import { useState } from "react";
import { Heart, MessageSquarePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DisplayNameInput } from "@/components/common/DisplayNameInput";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useUserName } from "@/hooks/useUserName";
import { formatDateShort } from "@/utils/date";
import { cn } from "@/lib/utils";
import { useExerciseAdvice } from "../hooks/useExerciseAdvice";

/** 種目詳細の「みんなのアドバイス」共有セクション */
export function ExerciseAdviceSection({ exerciseId }: { exerciseId: string }) {
  const mounted = useHasMounted();
  const { advice, likedIds, isLoading, postAdvice, toggleLike } =
    useExerciseAdvice(exerciseId);
  const { name, saveName } = useUserName();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [draftName, setDraftName] = useState("");
  const [posting, setPosting] = useState(false);

  const startPost = () => {
    setDraftName(name);
    setOpen(true);
  };

  const submit = async () => {
    if (!body.trim()) return;
    setPosting(true);
    try {
      await saveName(draftName);
      await postAdvice(body, draftName);
      setBody("");
      setOpen(false);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">みんなのアドバイス</h2>
          {!open && (
            <Button variant="secondary" size="sm" onClick={startPost}>
              <MessageSquarePlus className="size-4" data-icon="inline-start" />
              投稿
            </Button>
          )}
        </div>

        {open && (
          <div className="mb-4 space-y-2 rounded-xl bg-secondary/50 p-3">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="コツ・気づき・注意点を共有しよう"
              rows={3}
              maxLength={280}
              className="w-full resize-none rounded-lg border border-border bg-card p-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
            <DisplayNameInput value={draftName} onChange={setDraftName} />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                やめる
              </Button>
              <Button
                size="sm"
                className="flex-1"
                disabled={!body.trim() || posting}
                onClick={submit}
              >
                {posting ? "投稿中…" : "共有する"}
              </Button>
            </div>
          </div>
        )}

        {!mounted || isLoading ? (
          <div className="h-16 animate-pulse rounded-xl bg-secondary/50" />
        ) : advice.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            まだアドバイスがありません。最初の一言を共有しよう！
          </p>
        ) : (
          <ul className="space-y-3">
            {advice.map((a) => {
              const liked = likedIds.has(a.id);
              return (
                <li key={a.id} className="border-t border-border/60 pt-3 first:border-0 first:pt-0">
                  <p className="text-sm leading-relaxed">{a.body}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">
                      {a.authorName}・{formatDateShort(a.createdAt.slice(0, 10))}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleLike(a.id)}
                      aria-label={liked ? "いいねを取り消す" : "いいね"}
                      className={cn(
                        "flex items-center gap-1 text-xs transition-colors",
                        liked ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      <Heart
                        className={cn("size-4", liked && "fill-primary")}
                      />
                      <span className="tabular-nums">{a.likeCount}</span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
