"use client";

import { useCallback, useEffect, useState } from "react";
import type { FriendRelation } from "@/types";
import { getRepos } from "@/repositories";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useUserName } from "@/hooks/useUserName";
import { createId } from "@/utils/id";

/**
 * 1人の相手との関係（none/pending/friends/blocked…）と操作。
 * 各操作後に関係を取り直して単一ボタンの表示を更新する。
 */
export function useFriendship(otherUid: string, otherName: string) {
  const { user } = useAuthUser();
  const myUid = user?.uid ?? null;
  const { name: myName } = useUserName();
  const [relation, setRelation] = useState<FriendRelation>({ state: "none" });
  const [busy, setBusy] = useState(false);

  const active = Boolean(myUid && otherUid && myUid !== otherUid);

  const reload = useCallback(async () => {
    if (!myUid || !active) return;
    const repos = await getRepos();
    setRelation(await repos.social.getRelationship(myUid, otherUid));
  }, [myUid, otherUid, active]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!myUid || !active) return;
      try {
        const repos = await getRepos();
        const rel = await repos.social.getRelationship(myUid, otherUid);
        if (!cancelled) setRelation(rel);
      } catch (e) {
        console.error("関係の取得に失敗", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [myUid, otherUid, active]);

  const run = useCallback(
    async (fn: (uid: string) => Promise<void>) => {
      if (!myUid) return;
      setBusy(true);
      try {
        await fn(myUid);
        await reload();
      } catch (e) {
        console.error("フレンド操作に失敗", e);
      } finally {
        setBusy(false);
      }
    },
    [myUid, reload],
  );

  const sendRequest = useCallback(
    () =>
      run(async (uid) => {
        const repos = await getRepos();
        await repos.social.sendFriendRequest({
          id: createId(),
          fromUserId: uid,
          fromName: myName,
          toUserId: otherUid,
          toName: otherName,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }),
    [run, myName, otherUid, otherName],
  );

  const accept = useCallback(
    () =>
      run(async (uid) => {
        if (!relation.requestId) return;
        const repos = await getRepos();
        // fromUserId=相手, toUserId=自分
        await repos.social.acceptFriendRequest(relation.requestId, otherUid, uid);
      }),
    [run, relation.requestId, otherUid],
  );

  const decline = useCallback(
    () =>
      run(async () => {
        if (!relation.requestId) return;
        const repos = await getRepos();
        await repos.social.declineFriendRequest(relation.requestId);
      }),
    [run, relation.requestId],
  );

  const cancel = useCallback(
    () =>
      run(async () => {
        if (!relation.requestId) return;
        const repos = await getRepos();
        await repos.social.cancelFriendRequest(relation.requestId);
      }),
    [run, relation.requestId],
  );

  const block = useCallback(
    () => run((uid) => getRepos().then((r) => r.social.blockUser(uid, otherUid))),
    [run, otherUid],
  );

  const unblock = useCallback(
    () => run((uid) => getRepos().then((r) => r.social.unblockUser(uid, otherUid))),
    [run, otherUid],
  );

  return {
    relation,
    busy,
    active,
    sendRequest,
    accept,
    decline,
    cancel,
    block,
    unblock,
    reload,
  };
}
