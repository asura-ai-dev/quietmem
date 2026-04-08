import styles from "./Placeholder.module.css";

/**
 * EditorTab
 *
 * Monaco ベースのエディタを将来載せるタブ (QTM-004)。
 * Phase 1 ではプレースホルダのみ。
 */
function EditorTab() {
  return (
    <div className={styles.root}>
      <div className={styles.eyebrow}>Editor</div>
      <h2 className={styles.title}>静かに書く場所</h2>
      <p className={styles.description}>
        Monaco ベースのコードエディタと minimal なファイルツリーを
        QTM-004 で組み込みます。Phase 1 ではプレースホルダのみ表示します。
      </p>
      <div className={styles.hintRow}>
        <span className={styles.badge}>Upcoming</span>
        <span className={styles.hintText}>QTM-004 · Monaco + FileTree</span>
      </div>
    </div>
  );
}

export default EditorTab;
