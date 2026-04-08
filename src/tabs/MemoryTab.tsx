import styles from "./Placeholder.module.css";

/**
 * MemoryTab
 */
function MemoryTab() {
  return (
    <div className={styles.root}>
      <div className={styles.eyebrow}>Memory</div>
      <h2 className={styles.title}>Raw と Curated の二層記憶</h2>
      <p className={styles.description}>
        Raw Memory Entries と Curated Memories を並べ、
        promotion / digest / embedding のフローをこのタブで扱います。
        Phase 1 ではテーブル骨格のみ用意し、UI は QTM-005 で実装します。
      </p>
      <div className={styles.hintRow}>
        <span className={styles.badge}>Upcoming</span>
        <span className={styles.hintText}>QTM-005 · Memory Curation</span>
      </div>
    </div>
  );
}

export default MemoryTab;
