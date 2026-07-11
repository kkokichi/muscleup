"use client";

import { useState } from "react";
import Image from "next/image";
import { LogIn, LogOut, UserCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signOutUser } from "@/lib/firebase";
import { migrateLocalToCloud } from "@/repositories/migration";
import { useAuthUser } from "../hooks/useAuthUser";

/** Googleログイン / ログアウト。ログイン中は個人データがアカウントに保存される */
export function AccountSection() {
  const { user, loading } = useAuthUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
      // 端末ローカルのデータをアカウントへ移行（クラウドが空の場合のみ）
      await migrateLocalToCloud();
      // Repository Factory を再評価するためリロード
      window.location.reload();
    } catch (e) {
      const code = (e as { code?: string })?.code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        setError(null);
      } else if (code === "auth/operation-not-allowed" || code === "auth/configuration-not-found") {
        setError("Googleログインが未設定です（Firebaseコンソールで有効化が必要）");
      } else {
        setError("ログインに失敗しました。時間をおいて再度お試しください");
        console.error(e);
      }
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
              <p className="mt-2 text-[11px] text-destructive">{error}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
