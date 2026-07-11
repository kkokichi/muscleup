"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LogIn, LogOut, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  authErrorCode,
  getGoogleRedirectResult,
  isPopupUnsupportedError,
  signInWithGoogle,
  signInWithGoogleRedirect,
  signOutUser,
} from "@/lib/firebase";
import { migrateLocalToCloud } from "@/repositories/migration";
import { useAuthUser } from "@/hooks/useAuthUser";

/** 認証エラーコードを日本語の案内に変換 */
function messageForCode(code: string): string {
  switch (code) {
    case "auth/unauthorized-domain":
      return "このドメインが未承認です。Firebaseコンソール → Authentication → Settings → 承認済みドメインに kkokichi.github.io を追加してください";
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return "Googleログインが有効化されていません（Firebaseコンソールで有効化が必要）";
    case "auth/network-request-failed":
      return "ネットワークエラーです。通信環境をご確認ください";
    default:
      return `ログインに失敗しました（${code || "不明なエラー"}）`;
  }
}

/** Googleログイン / ログアウト。ログイン中は個人データがアカウントに保存される */
export function AccountSection() {
  const { user, loading } = useAuthUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirectHandled = useRef(false);

  // リダイレクト方式のログインから戻ってきた場合の処理
  useEffect(() => {
    if (redirectHandled.current) return;
    redirectHandled.current = true;
    (async () => {
      try {
        const redirectedUser = await getGoogleRedirectResult();
        if (redirectedUser) {
          setBusy(true);
          await migrateLocalToCloud();
          window.location.reload();
        }
      } catch (e) {
        setError(messageForCode(authErrorCode(e)));
      }
    })();
  }, []);

  const finishLogin = async () => {
    // 端末ローカルのデータをアカウントへ移行（クラウドが空の場合のみ）
    await migrateLocalToCloud();
    // Repository Factory を再評価するためリロード
    window.location.reload();
  };

  const handleLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      await finishLogin();
    } catch (e) {
      const code = authErrorCode(e);
      if (code === "auth/cancelled-popup-request") {
        setBusy(false);
        return;
      }
      // ポップアップが塞がれる環境（iOS Safari等）はリダイレクトに切替
      if (isPopupUnsupportedError(e)) {
        try {
          await signInWithGoogleRedirect();
          return; // 画面が遷移する
        } catch (redirectErr) {
          setError(messageForCode(authErrorCode(redirectErr)));
          setBusy(false);
          return;
        }
      }
      console.error("Googleログイン失敗", e);
      setError(messageForCode(code));
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await signOutUser();
      window.location.reload();
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        {loading ? (
          <div className="h-10 animate-pulse rounded-xl bg-secondary/50" />
        ) : user ? (
          <div className="flex items-center gap-3">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt=""
                width={40}
                height={40}
                unoptimized
                className="size-10 rounded-full"
              />
            ) : (
              <UserCircle className="size-10 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {user.displayName ?? "ログイン中"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user.email}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              disabled={busy}
            >
              <LogOut className="size-4" data-icon="inline-start" />
              ログアウト
            </Button>
          </div>
        ) : (
          <div>
            <p className="mb-1 text-sm font-semibold">アカウント</p>
            <p className="mb-3 text-[11px] text-muted-foreground">
              Googleでログインすると、トレーニング記録がアカウントに保存され、
              別の端末でも同じデータを見られます。
            </p>
            <Button className="w-full" onClick={handleLogin} disabled={busy}>
              <LogIn className="size-4" data-icon="inline-start" />
              {busy ? "ログイン中…" : "Googleでログイン"}
            </Button>
            {error && (
              <p className="mt-2 text-[11px] leading-relaxed text-destructive">
                {error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
