import { useUiStore } from "../store/uiStore";
import styles from "./SettingsRoute.module.css";

/**
 * SettingsRoute
 *
 * Workspace Shell とは別レイアウトで表示される Settings 画面。
 * Phase 1 では最小実装 (eyebrow + title + subtitle + 戻るボタン) のみ。
 *
 * 参照:
 * - agent-docs/ui-shell.md (別画面方針 / SettingsRoute セクション)
 * - tasks/phase-1E/task-1E05.md
 * - spec.md §4.5 別画面方針
 */
function SettingsRoute() {
  const setRoute = useUiStore((state) => state.setRoute);

  return (
    <div className={styles.root}>
      <main className={styles.card}>
        <div className={styles.eyebrow}>QuietMem · Screen</div>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>
          アプリケーション設定は後続フェーズで実装します。
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => setRoute("workspace")}
          >
            ワークスペースに戻る
          </button>
        </div>
      </main>
    </div>
  );
}

export default SettingsRoute;
