"use client";

import { useEffect, useState } from "react";
import { subscribeAuth } from "@/lib/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/** ログイン中のユーザーを監視する（匿名は未ログイン扱い） */
export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth((u) => {
      setUser(
        u && !u.isAnonymous
          ? {
              uid: u.uid,
              email: u.email,
              displayName: u.displayName,
              photoURL: u.photoURL,
            }
          : null,
      );
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
