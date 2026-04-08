import { useProjectStore } from "../store/projectStore";
import styles from "./LeftSidebar.module.css";

/**
 * LeftSidebar
 *
 * Workspace Shell の左ペイン (grid-area: left)。
 * Projects セクションと Agents セクション (プレースホルダ) を縦に積む。
 *
 * - Projects: `projectStore.projects` を `<ul>` で列挙し、click で
 *   `selectProject(id)` を呼ぶ。選択中 project は `--accent-primary`
 *   (セージグリーン) でハイライトする
 * - Agents: 選択中 project 配下の agent を表示するプレースホルダ。
 *   実データ統合は task-1F 系で行うため、Phase 1 ではコメントを出す
 *
 * 参照:
 * - agent-docs/ui-shell.md (コンポーネント階層、Overview タブ内構成)
 * - tasks/phase-1E/task-1E02.md
 */
function LeftSidebar() {
  const projects = useProjectStore((state) => state.projects);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const selectProject = useProjectStore((state) => state.selectProject);

  return (
    <aside className={styles.root} aria-label="Workspace sidebar">
      <section className={styles.section} aria-label="Projects">
        <h2 className={styles.sectionLabel}>Projects</h2>
        {projects.length === 0 ? (
          <p className={styles.emptyState}>Project がまだありません</p>
        ) : (
          <ul className={styles.list}>
            {projects.map((project) => {
              const isSelected = project.id === selectedProjectId;
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    className={
                      isSelected
                        ? `${styles.itemButton} ${styles.itemButtonSelected}`
                        : styles.itemButton
                    }
                    aria-pressed={isSelected}
                    onClick={() => selectProject(project.id)}
                  >
                    <span className={styles.itemName}>{project.name}</span>
                    <span className={styles.itemSlug}>{project.slug}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={styles.section} aria-label="Agents">
        <h2 className={styles.sectionLabel}>Agents</h2>
        {selectedProjectId === null ? (
          <p className={styles.emptyState}>Project を選択してください</p>
        ) : (
          <p className={styles.placeholder}>
            {/* 実データ統合は task-1F で追加予定 */}
            Agent 一覧は後続タスクで接続します
          </p>
        )}
      </section>
    </aside>
  );
}

export default LeftSidebar;
