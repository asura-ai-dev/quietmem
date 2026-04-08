import styles from "./Placeholder.module.css";

/**
 * RunsTab
 */
function RunsTab() {
  return (
    <div className={styles.root}>
      <div className={styles.eyebrow}>Runs</div>
      <h2 className={styles.title}>Agent の実行履歴</h2>
      <p className={styles.description}>
        Agent ごとの Run と interaction log を時系列で閲覧します。
        Adapter 実装と Run 実行パイプラインは QTM-006 で接続します。
      </p>
      <div className={styles.hintRow}>
        <span className={styles.badge}>Upcoming</span>
        <span className={styles.hintText}>QTM-006 · Adapter &amp; Run</span>
      </div>
    </div>
  );
}

export default RunsTab;
