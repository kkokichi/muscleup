import Link from "next/link";
import { HardDrive } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function FriendsPage() {
  return (
    <div>
      <PageHeader title="端末保存モード" subtitle="ログイン機能は使用しません" />
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
            <HardDrive className="size-6 text-primary" />
          </span>
          <p className="text-sm font-semibold">記録はこの端末だけに保存されます</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            表示速度を優先するため、フレンドなどのオンライン機能は停止しています。
          </p>
          <Link
            href="/"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            ホームへ戻る
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
