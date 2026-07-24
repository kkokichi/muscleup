"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, MailCheck, ShieldAlert, UserCircle, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PASSWORD_MIN_LENGTH,
  authErrorCode,
  hasPasswordProvider,
  linkPasswordToCurrentUser,
  onAuthReady,
  sendPasswordReset,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
} from "@/lib/firebase";
import { migrateLocalToCloud } from "@/repositories/migration";
import { useAuthUser } from "@/hooks/useAuthUser";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

/** 認証エラーコードを日本語の案内に変換 */
function messageForCode(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません";
    case "auth/missing-password":
      return "パスワードを入力してください";
    case "auth/weak-password":
      return `パスワードは${PASSWORD_MIN_LENGTH}文字以上にしてください`;
    case "auth/email-already-in-use":
      return "このメールアドレスは既に登録されています。ログインしてください";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "メールアドレスまたはパスワードが違います";
    case "auth/too-many-requests":
      return "試行回数が多すぎます。しばらく待ってからお試しください";
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return "メール/パスワードログインが有効化されていません（Firebaseコンソールで有効化が必要）";
    case "auth/network-request-failed":
      return "ネットワークエラーです。通信環境をご確認ください";
    case "auth/provider-already-linked":
    case "auth/credential-already-in-use":
      return "このアカウントには既にパスワードが設定されています";
    case "auth/requires-recent-login":
      return "セキュリティのため、一度ログアウトしてからやり直してください";
    default:
      return `処理に失敗しました（${code || "不明なエラー"}）`;
  }
}

/**
 * メールアドレス + パスワードのログイン / 新規登録 / ログアウト。
 * ログイン中は個人データがアカウント（Firestore users/{uid}）に保存される。
 */
export function AccountSection() {
  const { user, loading } = useAuthUser();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** 旧Googleログインのセッションが残っていて、パスワード未設定のアカウント */
  const [needsPassword, setNeedsPassword] = useState(false);

  // 旧Googleログインのままのアカウントを検出する。
  // パスワードを設定（linkWithCredential）すればUIDは変わらず、記録はそのまま残る。
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const current = await onAuthReady();
      if (cancelled) return;
      setNeedsPassword(Boolean(current && !hasPasswordProvider(current)));
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const finishLogin = async () => {
    // 端末ローカルのデータをアカウントへ移行（クラウドが空の場合のみ）
    await migrateLocalToCloud();
    // Repository Factory を再評価するためリロード
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        if (password.length < PASSWORD_MIN_LENGTH) {
          throw Object.assign(new Error("weak"), { code: "auth/weak-password" });
        }
        await signUpWithEmail(email, password, displayName);
      } else {
        await signInWithEmail(email, password);
      }
      await finishLogin();
    } catch (err) {
      console.error(mode === "signup" ? "新規登録に失敗" : "ログインに失敗", err);
      setError(messageForCode(authErrorCode(err)));
      setBusy(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("パスワードを再設定するメールアドレスを入力してください");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setNotice("パスワード再設定メールを送信しました");
    } catch (err) {
      setError(messageForCode(authErrorCode(err)));
    }
    setBusy(false);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (password.length < PASSWORD_MIN_LENGTH) {
        throw Object.assign(new Error("weak"), { code: "auth/weak-password" });
      }
      await linkPasswordToCurrentUser(password);
      setPassword("");
      setNeedsPassword(false);
      setNotice("パスワードを設定しました。次回からメールアドレスでログインできます");
    } catch (err) {
      console.error("パスワード設定に失敗", err);
      setError(messageForCode(authErrorCode(err)));
    }
    setBusy(false);
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await signOutUser();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="h-10 animate-pulse rounded-xl bg-secondary/50" />
        </CardContent>
      </Card>
    );
  }

  if (user) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <UserCircle className="size-10 shrink-0 text-muted-foreground" />
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

          {needsPassword && (
            <form
              onSubmit={handleSetPassword}
              className="space-y-2 rounded-xl bg-secondary/60 p-3"
            >
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <ShieldAlert className="size-4 text-primary" />
                パスワードを設定してください
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                このアカウントはまだパスワードが未設定です。設定すると、同じアカウント
                （記録もそのまま）にメールアドレスとパスワードでログインできます。
              </p>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder={`新しいパスワード（${PASSWORD_MIN_LENGTH}文字以上）`}
                className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "設定中…" : "パスワードを設定"}
              </Button>
            </form>
          )}

          {notice && (
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-primary">
              <MailCheck className="mt-px size-3.5 shrink-0" />
              {notice}
            </p>
          )}
          {error && (
            <p className="text-[11px] leading-relaxed text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4">
        <p className="mb-1 text-sm font-semibold">アカウント</p>
        <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
          ログインすると、トレーニング記録がアカウントに保存され、
          別の端末でも同じデータを見られます。
        </p>

        <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError(null);
                setNotice(null);
              }}
              className={cn(
                "rounded-lg py-2 text-xs font-semibold transition-colors",
                mode === m
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              {m === "login" ? "ログイン" : "新規登録"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            aria-label="メールアドレス"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              mode === "signup"
                ? `パスワード（${PASSWORD_MIN_LENGTH}文字以上）`
                : "パスワード"
            }
            aria-label="パスワード"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          {mode === "signup" && (
            <input
              type="text"
              autoComplete="nickname"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名（任意）"
              aria-label="表示名"
              className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
            />
          )}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {mode === "signup" ? (
              <UserPlus className="size-4" data-icon="inline-start" />
            ) : (
              <LogIn className="size-4" data-icon="inline-start" />
            )}
            {busy
              ? mode === "signup"
                ? "登録中…"
                : "ログイン中…"
              : mode === "signup"
                ? "新規登録"
                : "ログイン"}
          </Button>
        </form>

        {mode === "login" && (
          <button
            type="button"
            onClick={handleResetPassword}
            disabled={busy}
            className="mt-2 text-[11px] font-medium text-muted-foreground underline underline-offset-2"
          >
            パスワードをお忘れの方
          </button>
        )}

        {notice && (
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-primary">
            <MailCheck className="mt-px size-3.5 shrink-0" />
            {notice}
          </p>
        )}
        {error && (
          <p className="mt-2 text-[11px] leading-relaxed text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
