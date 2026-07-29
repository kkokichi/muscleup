"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  /** 「再試行」で子ツリーを作り直すためのキー */
  resetKey: number;
}

/**
 * 画面描画中に例外が起きても、真っ白（非表示）にせず復帰UIを出す。
 * 以前は ErrorBoundary が無かったため、ホーム等の描画時例外がそのまま
 * 画面全体の消失につながっていた。
 *
 * 「再試行」はフルリロード（standalone PWA で白画面になりやすい）を避け、
 * resetKey を変えて子ツリーを再マウントする。
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("画面の描画でエラーが発生しました", error, info);
  }

  private handleRetry = () => {
    this.setState((s) => ({ hasError: false, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm font-semibold">画面の表示に問題が発生しました</p>
          <p className="text-xs text-muted-foreground">
            通信状況を確認して、もう一度お試しください。
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground active:opacity-90"
          >
            再試行
          </button>
        </div>
      );
    }
    return <div key={this.state.resetKey} className="contents">{this.props.children}</div>;
  }
}
