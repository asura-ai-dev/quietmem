import styles from "./RightPanel.module.css";

/**
 * RightPanel (Interaction Panel)
 *
 * Workspace Shell の右ペイン (grid-area: right)。チャット UI ではなく、
 * 以下 3 セクションを上から積むレイアウトのみ (Phase 1 は機能しない)。
 *
 * 1. TaskInputSection: 次のタスク入力 (textarea + Run ボタン, 両方 disabled)
 * 2. LatestInteractionsSection: 実行履歴プレースホルダ
 * 3. MemoryContextPreviewSection: 参照中 memory プレースホルダ
 *
 * 参照:
 * - agent-docs/ui-shell.md (RightPanel 節)
 * - tasks/phase-1E/task-1E02.md
 */
function RightPanel() {
  return (
    <aside className={styles.root} aria-label="Interaction panel">
      <section className={styles.section} aria-label="Task input">
        <header className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Next Task</h3>
          <span className={styles.sectionHint}>disabled · phase 1</span>
        </header>
        <div className={styles.sectionBody}>
          <textarea
            className={styles.taskInput}
            placeholder="例: この raw memory を curated memory に昇格して、タグを付け直す"
            disabled
            rows={4}
            aria-label="Next task prompt"
          />
          <button type="button" className={styles.runButton} disabled>
            Run
          </button>
        </div>
      </section>

      <section className={styles.section} aria-label="Latest interactions">
        <header className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Latest Interactions</h3>
        </header>
        <div className={styles.sectionBody}>
          <p className={styles.emptyState}>
            まだ実行がありません。Agent を作って最初のタスクを回すと、ここに履歴が積まれます。
          </p>
        </div>
      </section>

      <section className={styles.section} aria-label="Memory context preview">
        <header className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Memory Context</h3>
        </header>
        <div className={styles.sectionBody}>
          <p className={styles.emptyState}>
            参照中の memory はありません。Run に添付した context がここに並びます。
          </p>
        </div>
      </section>
    </aside>
  );
}

export default RightPanel;
