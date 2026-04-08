import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./ErrorBoundary.module.css";

/**
 * ErrorBoundary
 *
 * React class component が `getDerivedStateFromError` /
 * `componentDidCatch` を提供する都合で残っている数少ないユースケース。
 * Workspace 配下の予期せぬ例外をキャッチし、画面全体がブランクになるのを
 * 防ぐためのセーフティネット。
 *
 * 設計方針:
 * - 最小実装。`fallback` prop で差し替え可能 (任意)
 * - デフォルト fallback はテーマトークンを使った静かな案内
 * - エラーは console.error にダンプして開発者が原因を辿れるようにする
 *
 * 参照:
 * - tasks/phase-1F/task-1F06.md (zustand selector 安定化と Error Boundary)
 * - agent-docs/ui-shell.md (デザイントークン)
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary] caught error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className={styles.root}>
          <div className={styles.card}>
            <div className={styles.eyebrow}>QUIETMEM · ERROR</div>
            <h1 className={styles.title}>
              アプリケーションでエラーが発生しました
            </h1>
            <p className={styles.message}>
              {this.state.error?.message ?? "Unknown error"}
            </p>
            <p className={styles.hint}>
              アプリを再起動してください。問題が続く場合は issue
              を報告してください。
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
