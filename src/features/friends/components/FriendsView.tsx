"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicProfile } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { useHasMounted } from "@/hooks/useHasMounted";
import { getRepos } from "@/repositories";
import { cn } from "@/lib/utils";
import { LoginPrompt } from "@/components/common/LoginPrompt";
import { useFriendData } from "../hooks/useFriendData";
import { useBlockedUsers } from "@/features/checkin/hooks/useBlockedUsers";
import { FriendButton } from "./FriendButton";

type Tab = "received" | "friends" | "sent";

interface Suggestion {
  uid: string;
  name: string;
  reason: string;
}

/** 1行: 名前＋関係ボタン */
function UserRow({
  uid,
  name,
  sub,
  onChanged,
}: {
  uid: string;
  name: string;
  sub?: string;
  onChanged: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary/30 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        {sub && <p className="truncate text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <FriendButton userId={uid} userName={name} onChanged={onChanged} />
    </div>
  );
}

/** フレンド画面: 受信/フレンド/送信、名前検索、同じジムのおすすめ */
export function FriendsView() {
  const mounted = useHasMounted();
  const { uid, received, sent, friends, isLoading, reload } = useFriendData();
  const { hiddenIds } = useBlockedUsers();
  const [tab, setTab] = useState<Tab>("received");

  const [queryText, setQueryText] = useState("");
  const [results, setResults] = useState<PublicProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // 名前検索（前方一致・デバウンス）
  useEffect(() => {
    const q = queryText.trim();
    let cancelled = false;
    const t = window.setTimeout(async () => {
      if (cancelled) return;
      if (!q) {
        setResults([]);
        setSearching(false);
        return;
      }
      setSearching(true);
      try {
        const repos = await getRepos();
        const list = await repos.social.searchProfilesByName(q, 20);
        if (!cancelled) setResults(list.filter((p) => p.uid !== uid));
      } catch (e) {
        console.error("検索に失敗", e);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [queryText, uid]);

  // おすすめ: 自分がチェックインしたジムに来ている他ユーザー
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    (async () => {
      try {
        const repos = await getRepos();
        const checkins = await repos.checkins.getAll();
        const myGyms = new Set(
          checkins.filter((c) => c.userId === uid).map((c) => c.gymName),
        );
        const exclude = new Set<string>([
          uid,
          ...friends.map((f) => f.uid),
          ...received.map((r) => r.fromUserId),
          ...sent.map((r) => r.toUserId),
          ...hiddenIds,
        ]);
        const seen = new Set<string>();
        const list: Suggestion[] = [];
        for (const c of checkins) {
          if (exclude.has(c.userId) || seen.has(c.userId)) continue;
          if (!myGyms.has(c.gymName)) continue;
          seen.add(c.userId);
          list.push({
            uid: c.userId,
            name: c.authorName,
            reason: `同じ「${c.gymName}」でチェックイン`,
          });
          if (list.length >= 10) break;
        }
        if (!cancelled) setSuggestions(list);
      } catch (e) {
        console.error("おすすめの算出に失敗", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid, friends, received, sent, hiddenIds]);

  const tabs = useMemo(
    () =>
      [
        { key: "received" as const, label: `受信 ${received.length || ""}`.trim() },
        { key: "friends" as const, label: `フレンド ${friends.length || ""}`.trim() },
        { key: "sent" as const, label: `送信中 ${sent.length || ""}`.trim() },
      ],
    [received.length, friends.length, sent.length],
  );

  if (mounted && !isLoading && !uid) {
    return (
      <div>
        <PageHeader title="フレンド" subtitle="トレーニー同士でつながる" />
        <LoginPrompt message="ログインするとフレンドとつながれます" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="フレンド" subtitle="トレーニー同士でつながる" />

      {/* 検索 */}
      <input
        value={queryText}
        onChange={(e) => setQueryText(e.target.value)}
        placeholder="名前で検索して申請"
        className="mb-3 h-11 w-full rounded-xl border border-border bg-card px-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
      />
      {queryText.trim() && (
        <div className="mb-4 space-y-2">
          {searching ? (
            <div className="h-12 animate-pulse rounded-xl bg-card" />
          ) : results.length === 0 ? (
            <p className="text-xs text-muted-foreground">該当するユーザーがいません</p>
          ) : (
            results.map((p) => (
              <UserRow key={p.uid} uid={p.uid} name={p.displayName} onChanged={reload} />
            ))
          )}
        </div>
      )}

      {/* タブ */}
      <div className="mb-3 grid grid-cols-3 gap-1 rounded-xl bg-secondary p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-lg py-2 text-xs font-semibold transition-colors",
              tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {tab === "received" &&
          (received.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              届いている申請はありません
            </p>
          ) : (
            received.map((r) => (
              <UserRow key={r.id} uid={r.fromUserId} name={r.fromName} onChanged={reload} />
            ))
          ))}
        {tab === "friends" &&
          (friends.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              まだフレンドがいません。おすすめや検索から申請しよう！
            </p>
          ) : (
            friends.map((f) => (
              <UserRow key={f.uid} uid={f.uid} name={f.name} onChanged={reload} />
            ))
          ))}
        {tab === "sent" &&
          (sent.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              送信中の申請はありません
            </p>
          ) : (
            sent.map((r) => (
              <UserRow key={r.id} uid={r.toUserId} name={r.toName} onChanged={reload} />
            ))
          ))}
      </div>

      {/* おすすめ */}
      {suggestions.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-bold">おすすめのつながり</h2>
          <div className="space-y-2">
            {suggestions.map((s) => (
              <UserRow
                key={s.uid}
                uid={s.uid}
                name={s.name}
                sub={s.reason}
                onChanged={reload}
              />
            ))}
          </div>
        </section>
      )}

      {mounted && isLoading && <div className="mt-4 h-20 animate-pulse rounded-2xl bg-card" />}
    </div>
  );
}
