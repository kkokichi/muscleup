"use client";

import { Ban, Check, UserPlus, X } from "lucide-react";
import { useFriendship } from "../hooks/useFriendship";

interface FriendButtonProps {
  userId: string;
  userName: string;
  /** ブロック/解除など関係が変わったときに呼ぶ（フィード再フィルタ用） */
  onChanged?: () => void;
}

const pill =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50";
const primary =
  "border-primary bg-primary text-primary-foreground active:opacity-90";
const ghost = "border-border bg-secondary/40 text-muted-foreground active:bg-secondary";

/**
 * 相手との関係に応じて表示が変わる単一のフレンド操作ボタン群。
 * （申請する / 申請中 / 承認・拒否 / フレンド / ブロック解除）
 * チェックイン投稿者・フレンド一覧・検索結果から共通利用する。
 */
export function FriendButton({ userId, userName, onChanged }: FriendButtonProps) {
  const {
    relation,
    busy,
    active,
    sendRequest,
    accept,
    decline,
    cancel,
    block,
    unblock,
  } = useFriendship(userId, userName);

  if (!active) return null;

  const confirmBlock = () => {
    if (
      window.confirm(
        `${userName}さんをブロックしますか？\n（フレンドなら解除され、投稿が表示されなくなります）`,
      )
    ) {
      void block().then(() => onChanged?.());
    }
  };

  const handleUnblock = () => void unblock().then(() => onChanged?.());

  switch (relation.state) {
    case "blocked_by_me":
      return (
        <button type="button" className={`${pill} ${ghost}`} disabled={busy} onClick={handleUnblock}>
          <Ban className="size-3.5" />
          ブロック解除
        </button>
      );
    case "blocked_by_them":
      return null;
    case "friends":
      return (
        <span className="inline-flex items-center gap-1.5">
          <span className={`${pill} border-primary bg-primary/10 text-primary`}>
            <Check className="size-3.5" />
            フレンド
          </span>
          <button
            type="button"
            aria-label={`${userName}をブロック`}
            className={`${pill} ${ghost}`}
            disabled={busy}
            onClick={confirmBlock}
          >
            <Ban className="size-3.5" />
          </button>
        </span>
      );
    case "pending_sent":
      return (
        <button type="button" className={`${pill} ${ghost}`} disabled={busy} onClick={() => cancel()}>
          申請中（取消）
        </button>
      );
    case "pending_received":
      return (
        <span className="inline-flex items-center gap-1.5">
          <button type="button" className={`${pill} ${primary}`} disabled={busy} onClick={() => accept()}>
            <Check className="size-3.5" />
            承認
          </button>
          <button type="button" className={`${pill} ${ghost}`} disabled={busy} onClick={() => decline()}>
            <X className="size-3.5" />
            拒否
          </button>
        </span>
      );
    default: // none
      return (
        <span className="inline-flex items-center gap-1.5">
          <button type="button" className={`${pill} ${primary}`} disabled={busy} onClick={() => sendRequest()}>
            <UserPlus className="size-3.5" />
            フレンド申請
          </button>
          <button
            type="button"
            aria-label={`${userName}をブロック`}
            className={`${pill} ${ghost}`}
            disabled={busy}
            onClick={confirmBlock}
          >
            <Ban className="size-3.5" />
          </button>
        </span>
      );
  }
}
