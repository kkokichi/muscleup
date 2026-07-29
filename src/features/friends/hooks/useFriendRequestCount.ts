"use client";

import { useEffect, useState } from "react";
import { getRepos } from "@/repositories";
import { useAuthUser } from "@/hooks/useAuthUser";

/** 自分宛の保留中フレンド申請の件数（ホームの気づき用） */
export function useFriendRequestCount() {
  const { user } = useAuthUser();
  const uid = user?.uid ?? null;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!uid) {
        if (!cancelled) setCount(0);
        return;
      }
      try {
        const repos = await getRepos();
        const received = await repos.social.getReceivedRequests(uid);
        if (!cancelled) setCount(received.length);
      } catch (e) {
        console.error("フレンド申請数の取得に失敗", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return count;
}
