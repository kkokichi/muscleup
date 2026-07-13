import Link from "next/link";
import { Award, History, Medal, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const LINKS = [
  { href: "/achievements", label: "ベスト", icon: Award },
  { href: "/badges", label: "バッジ", icon: Medal },
  { href: "/history", label: "履歴", icon: History },
  { href: "/massu", label: "マッスー", icon: Sparkles },
] as const;

/** ホームから各セクションへのクイックリンク */
export function HomeQuickLinks() {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} className="block">
          <Card className="border-border bg-card transition-colors active:bg-secondary/50">
            <CardContent className="flex flex-col items-center gap-1.5 p-3">
              <Icon className="size-5 text-primary" />
              <span className="text-xs font-semibold">{label}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
