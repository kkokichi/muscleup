"use client";

import { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { CHECKIN_COMMENT_MAX_LENGTH } from "@/types";
import { formatDateShort } from "@/utils/date";
import { useCheckinComments } from "../hooks/useCheckinComments";

interface CheckinCommentsProps {
  checkinId: string;
  currentUserId: string | null;
  currentUserName: string;
}

/** チェックイン1件の応援コメント（一覧＋投稿）。カード展開時にのみ描画される */
export function CheckinComments({
  checkinId,
  currentUserId,
  currentUserName,
}: CheckinCommentsProps) {
  const { comments, isLoading, posting, add, remove, canPost } =
    useCheckinComments({ checkinId, currentUserId, currentUserName });
  const [draft, setDraft] = useState("");

  const handleSend = async () => {
    if (!draft.trim() || posting) return;
    const ok = await add(draft);
    if (ok) setDraft("");
  };

  return (
    <div className="mt-2 border-t border-border pt-2">
      {isLoading ? (
        <div className="h-8 animate-pulse rounded-lg bg-secondary/50" />
      ) : comments.length === 0 ? (
        <p className="py-1 text-[11px] text-muted-foreground">
          まだコメントはありません。最初の応援を送ろう！
        </p>
      ) : (
        <ul className="space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm">{c.body}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {c.authorName}・{formatDateShort(c.createdAt.slice(0, 10))}
                </p>
              </div>
              {currentUserId === c.userId && (
                <button
                  type="button"
                  aria-label="コメントを削除"
                  onClick={() => remove(c.id)}
                  className="shrink-0 rounded-full p-1 text-muted-foreground active:bg-secondary"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {canPost && (
        <div className="mt-2 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleSend();
              }
            }}
            placeholder="応援コメントを送る"
            maxLength={CHECKIN_COMMENT_MAX_LENGTH}
            className="h-9 min-w-0 flex-1 rounded-full border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            aria-label="送信"
            onClick={handleSend}
            disabled={!draft.trim() || posting}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
