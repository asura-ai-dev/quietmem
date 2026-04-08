import { useProjectStore } from "../../store/projectStore";
import styles from "./ProjectList.module.css";

/**
 * ProjectList
 *
 * `useProjectStore.projects` を `<ul>` で列挙する。各項目は name / slug /
 * rootPath を 1 行に表示するボタンで、クリックで `selectProject(id)` を呼ぶ。
 * 選択中の項目は LeftSidebar と同じく `--accent-primary` (セージグリーン)
 * の左ボーダー + 薄い背景でハイライトする。
 *
 * 空状態は「Project がありません」の静かなメッセージを表示する
 * (LeftSidebar / RightPanel と揃えた amber ドット付き muted italic)。
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成 / デザイントークン)
 * - agent-docs/tauri-commands.md (Project DTO)
 * - tasks/phase-1F/task-1F01.md
 * - spec.md §4.7 / §5.1 / §9 (Project 一覧の受け入れ条件)
 */
function ProjectList() {
  const projects = useProjectStore((state) => state.projects);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const selectProject = useProjectStore((state) => state.selectProject);

  if (projects.length === 0) {
    return (
      <div className={styles.root}>
        <p className={styles.emptyState} role="status">
          Project がありません
        </p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <ul className={styles.list} aria-label="Project list">
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
                <span className={styles.itemRootPath}>{project.rootPath}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ProjectList;
