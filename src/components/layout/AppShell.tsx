import { TabBar } from "./TabBar";
import { MascotToast } from "@/features/mascot/components/MascotToast";

/** 全画面共通のシェル。モバイルファースト（max-w-md中央寄せ） */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      <main className="px-4 pb-32 pt-safe">{children}</main>
      <TabBar />
      <MascotToast />
    </div>
  );
}
