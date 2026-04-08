import styles from "./Placeholder.module.css";

/**
 * CronTab
 */
function CronTab() {
  return (
    <div className={styles.root}>
      <div className={styles.eyebrow}>Cron</div>
      <h2 className={styles.title}>静かに回るスケジュール</h2>
      <p className={styles.description}>
        Cron Job の定義と実行履歴はここに集約される予定です。
        具体的なスケジューラ UI は QTM-008 で実装します。
      </p>
      <div className={styles.hintRow}>
        <span className={styles.badge}>Upcoming</span>
        <span className={styles.hintText}>QTM-008 · Cron Scheduler</span>
      </div>
    </div>
  );
}

export default CronTab;
