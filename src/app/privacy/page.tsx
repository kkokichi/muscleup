import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata = {
  title: "プライバシーポリシー | MuscleUp",
};

/**
 * プライバシーポリシー。App Store Connect の「Privacy Policy URL」に登録する。
 * GitHub Pages 配信時: https://kkokichi.github.io/muscleup/privacy/
 */
export default function PrivacyPage() {
  return (
    <div className="pb-12">
      <PageHeader title="プライバシーポリシー" subtitle="MuscleUp" />

      <Link
        href="/settings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors active:text-primary"
      >
        <ChevronLeft className="size-4" />
        設定へ戻る
      </Link>

      <div className="space-y-5 text-sm leading-relaxed text-foreground">
        <p className="text-xs text-muted-foreground">最終更新日: 2026年7月30日</p>

        <p>
          MuscleUp（以下「本アプリ」）は、ユーザーのプライバシーを尊重します。
          本ポリシーは、本アプリが取り扱う情報とその目的を説明します。
        </p>

        <Section title="1. 収集・保存する情報">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <b>トレーニング記録</b>（種目・重量・回数・体重・写真など）は、
              既定では<b>お使いの端末内のみ</b>に保存されます。
            </li>
            <li>
              ログイン機能およびクラウド同期は使用しません。メールアドレスや
              パスワードを本アプリが収集することはありません。
            </li>
          </ul>
        </Section>

        <Section title="2. 利用目的">
          <p>
            端末内に保存した情報は、トレーニング記録の表示・集計など、
            本アプリの機能を提供する目的にのみ使用します。
          </p>
        </Section>

        <Section title="3. 第三者提供・広告・トラッキング">
          <p>
            本アプリは、ユーザーの個人データを第三者に販売しません。
            広告表示や広告目的のトラッキングは行いません。
            トレーニング記録を外部サービスへ送信しません。
          </p>
        </Section>

        <Section title="4. データの削除">
          <p>
            端末内のデータはアプリの削除、ブラウザのWebサイトデータ消去、
            または端末の設定から消去できます。
          </p>
        </Section>

        <Section title="5. お問い合わせ">
          <p>
            本ポリシーに関するお問い合わせは以下までご連絡ください。
            <br />
            連絡先:{" "}
            <a
              href="mailto:ichinose.koki.1218@gmail.com"
              className="font-semibold text-primary underline"
            >
              ichinose.koki.1218@gmail.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold">{title}</h2>
      {children}
    </section>
  );
}
