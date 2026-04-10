import { useEffect, type ReactNode } from "react";
import AgentCreateForm from "../features/agents/AgentCreateForm";
import AgentEditForm from "../features/agents/AgentEditForm";
import AgentList from "../features/agents/AgentList";
import ProjectCreateForm from "../features/projects/ProjectCreateForm";
import ProjectList from "../features/projects/ProjectList";
import WorktreeCreateForm from "../features/worktrees/WorktreeCreateForm";
import WorktreeList from "../features/worktrees/WorktreeList";
import { useAgentStore } from "../store/agentStore";
import { useProjectStore } from "../store/projectStore";
import { useUiStore } from "../store/uiStore";
import type { Agent, Worktree } from "../types/bindings";
import styles from "./OverviewTab.module.css";

// Stable empty-array constants. Returning a freshly allocated `[]` from a
// zustand selector breaks `useSyncExternalStore`'s identity comparison and
// causes `Maximum update depth exceeded`, which blanks the Workspace.
// Reusing these constants keeps the snapshot identity stable across renders,
// including when `selectedProjectId` is null.
const EMPTY_AGENTS: readonly Agent[] = [];
const EMPTY_WORKTREES: readonly Worktree[] = [];

/**
 * OverviewTab
 *
 * Overview タブの中身。Project / Agent / Worktree の一覧と作成フォームを
 * 縦に積む。task-1F01 で Project セクションを実 UI に接続し、
 * task-1F02 で Agent セクションを実 UI に接続し、
 * task-1F03 で Worktree セクションを実 UI に接続する。
 * task-1F04 で Agent セクションに AgentEditForm を接続し、
 * `activeWorktreeId` を Worktree 一覧から選択して保存できるようにする。
 *
 * 選択中 agent の id は Overview レベルで保持し、AgentList の各行の
 * 「編集」ボタンで `setSelectedAgentId` を呼ぶ。選択中 agent がある場合、
 * Agents セクション内に AgentEditForm を表示する。
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成)
 * - tasks/phase-1F/task-1F03.md
 * - spec.md §4.7 / §5.1 / §9 (Project / Agent / Worktree 受け入れ条件)
 */

interface SectionProps {
  title: string;
  hint?: string;
  disabled?: boolean;
  children: ReactNode;
}

function Section({ title, hint, disabled, children }: SectionProps) {
  return (
    <section
      className={
        disabled
          ? `${styles.section} ${styles.sectionDisabled}`
          : styles.section
      }
      aria-label={title}
      aria-disabled={disabled || undefined}
    >
      <header className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {hint && <span className={styles.sectionHint}>{hint}</span>}
      </header>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function OverviewTab() {
  const selectedProjectId = useProjectStore((state) => state.selectedProjectId);
  // task-2C06: 選択中 agent は uiStore に昇格し、LeftSidebar Agents セクション
  // (task-2C05) と OverviewTab の編集フォームで同一の真実源を共有する。
  // 参照: spec.md §4.7 / §10, agent-docs/phase-2-ui-design.md §6
  const selectedAgentId = useUiStore((state) => state.selectedAgentId);
  const setSelectedAgentId = useUiStore((state) => state.setSelectedAgentId);

  // 1F04: AgentEditForm に渡す agent / worktrees を store から取得する
  const agentsForProject = useAgentStore((state) =>
    selectedProjectId
      ? (state.agentsByProject[selectedProjectId] ?? EMPTY_AGENTS)
      : EMPTY_AGENTS,
  );
  const worktreesForProject = useAgentStore((state) =>
    selectedProjectId
      ? (state.worktreesByProject[selectedProjectId] ?? EMPTY_WORKTREES)
      : EMPTY_WORKTREES,
  );

  // Project 切替時に選択中 agent をリセット (別 project の agent が選択に残らないように)
  // setSelectedAgentId は zustand の action なので識別子は安定しているが、念のため deps に含める
  useEffect(() => {
    setSelectedAgentId(null);
  }, [selectedProjectId, setSelectedAgentId]);

  // 選択中 agent が削除/消失した場合にも state を掃除する
  useEffect(() => {
    if (
      selectedAgentId &&
      !agentsForProject.some((a) => a.id === selectedAgentId)
    ) {
      setSelectedAgentId(null);
    }
  }, [selectedAgentId, agentsForProject, setSelectedAgentId]);

  const selectedAgent =
    selectedAgentId != null
      ? (agentsForProject.find((a) => a.id === selectedAgentId) ?? null)
      : null;

  return (
    <div className={styles.root}>
      <Section title="Project">
        <ProjectList />
        <ProjectCreateForm />
      </Section>

      <Section
        title="Agents"
        hint={
          selectedProjectId
            ? `${agentsForProject.length} 件`
            : undefined
        }
        disabled={!selectedProjectId}
      >
        {selectedProjectId ? (
          <>
            <AgentList
              projectId={selectedProjectId}
              selectedAgentId={selectedAgentId}
              onSelect={setSelectedAgentId}
            />
            <AgentCreateForm projectId={selectedProjectId} />
            {selectedAgent && (
              <AgentEditForm
                key={selectedAgent.id}
                agent={selectedAgent}
                worktrees={worktreesForProject}
                onSaved={(updatedAgent) => setSelectedAgentId(updatedAgent.id)}
              />
            )}
          </>
        ) : (
          <p className={styles.placeholderSection}>
            Project を選択してください
          </p>
        )}
      </Section>

      <Section title="Worktrees" disabled={!selectedProjectId}>
        {selectedProjectId ? (
          <>
            <WorktreeList projectId={selectedProjectId} />
            <WorktreeCreateForm projectId={selectedProjectId} />
          </>
        ) : (
          <p className={styles.placeholderSection}>
            Project を選択してください
          </p>
        )}
      </Section>
    </div>
  );
}

export default OverviewTab;
