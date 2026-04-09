import { useEffect } from "react";
import { useProjectStore } from "../store/projectStore";
import { useAgentStore } from "../store/agentStore";
import { useUiStore } from "../store/uiStore";
import AgentStatusBadge from "../features/agents/AgentStatusBadge";
import type { Agent } from "../types/bindings";
import styles from "./LeftSidebar.module.css";

/**
 * LeftSidebar
 *
 * Workspace Shell の左ペイン (grid-area: left)。
 * Projects セクションと Agents セクションを縦に積む。
 *
 * - Projects: `projectStore.projects` を `<ul>` で列挙し、click で
 *   `selectProject(id)` を呼ぶ。選択中 project は `--accent-primary`
 *   (セージグリーン) でハイライトする
 * - Agents: 選択中 project 配下の Agent 一覧を表示する。各行は
 *   name + `AgentStatusBadge` の 1 行水平レイアウトで、click で
 *   `uiStore.setSelectedAgentId(id)` を呼び OverviewTab の編集フォームと連動する
 *
 * 参照:
 * - agent-docs/spec.md §4.2 / §4.7 (LeftSidebar 統合)
 * - agent-docs/phase-2-ui-design.md §1
 * - tasks/phase-2C/task-2C05.md
 */

// Phase 1F task-1F06 の zustand 無限ループ回帰防止:
// component 外の安定参照を `?? EMPTY_AGENTS` で返すことで、
// agentsByProject にキーが無いケースでも selector の参照等価性を保つ。
// これを怠ると `Maximum update depth exceeded` で Workspace がブランクになる。
const EMPTY_AGENTS: readonly Agent[] = [];

function LeftSidebar() {
  const projects = useProjectStore((state) => state.projects);
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  const selectProject = useProjectStore((state) => state.selectProject);

  const agents = useAgentStore((state) =>
    selectedProjectId
      ? (state.agentsByProject[selectedProjectId] ?? EMPTY_AGENTS)
      : EMPTY_AGENTS,
  );
  const refreshAgents = useAgentStore((state) => state.refreshAgents);

  const selectedAgentId = useUiStore((state) => state.selectedAgentId);
  const setSelectedAgentId = useUiStore((state) => state.setSelectedAgentId);

  useEffect(() => {
    if (selectedProjectId) {
      void refreshAgents(selectedProjectId);
    }
  }, [selectedProjectId, refreshAgents]);

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
        ) : agents.length === 0 ? (
          <p className={styles.emptyState}>Agent がまだありません</p>
        ) : (
          <ul className={styles.agentList}>
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <li key={agent.id}>
                  <button
                    type="button"
                    className={
                      isSelected
                        ? `${styles.agentItemButton} ${styles.agentItemButtonSelected}`
                        : styles.agentItemButton
                    }
                    aria-pressed={isSelected}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <span className={styles.agentItemName}>{agent.name}</span>
                    <span className={styles.agentItemBadge}>
                      <AgentStatusBadge status={agent.status} size="sm" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </aside>
  );
}

export default LeftSidebar;
