import Link from "next/link";
import { LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** ログインが必要なコミュニティ機能で表示する誘導カード */
export function LoginPrompt({ message }: { message: string }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <LogIn className="size-6 text-primary" />
        </span>
        <p className="text-sm font-semibold">{message}</p>
        <Link
          href="/settings"
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          ログイン / 新規登録
        </Link>
      </CardContent>
    </Card>
  );
}
