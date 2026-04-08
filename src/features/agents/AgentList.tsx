import { useEffect, useMemo } from "react";
import { useAgentStore } from "../../store/agentStore";
import type { Agent, Worktree } from "../../types/bindings";
import styles from "./AgentList.module.css";

// Stable empty-array constants shared across renders. Returning a freshly
// allocated `[]` from a zustand selector makes `useSyncExternalStore` think
// the snapshot changed every render (identity comparison), which triggers
// `Maximum update depth exceeded` and blanks the Workspace.
const EMPTY_AGENTS: readonly Agent[] = [];
const EMPTY_WORKTREES: readonly Worktree[] = [];

/**
 * AgentList
 *
 * 指定 projectId 配下の Agent 一覧を表示する。
 * マウント時および projectId 変更時に `agentStore.refreshAgents(projectId)` を呼び、
 * `agentsByProject[projectId]` を `<ul>` で列挙する。
 *
 * 各項目は name / role / adapterType / status / activeWorktree を表示する
 * `<li>` で、右端に「編集」ボタンを配置する。編集ボタンは上位から渡された
 * `onSelect(agentId)` を呼び、OverviewTab 側で AgentEditForm を表示する。
 * 選択中の項目は sage の左ボーダー + 薄い背景でハイライトする。
 *
 * `activeWorktreeId` は `worktreesByProject[projectId]` から lookup し、
 * 見つかれば `branchName` を表示する (未割当の場合は em dash)。
 *
 * 空状態は「Agent がありません」の静かなメッセージを表示する
 * (LeftSidebar / ProjectList と揃えた amber ドット付き muted italic)。
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成 / デザイントークン)
 * - agent-docs/tauri-commands.md (Agent DTO)
 * - tasks/phase-1F/task-1F02.md, task-1F04.md
 * - spec.md §4.7 / §5.1 / §9 (Agent 一覧の受け入れ条件)
 */

interface AgentListProps {
  projectId: string;
  selectedAgentId: string | null;
  onSelect: (agentId: string | null) => void;
}

function AgentList({ projectId, selectedAgentId, onSelect }: AgentListProps) {
  const agents = useAgentStore(
    (state) => state.agentsByProject[projectId] ?? EMPTY_AGENTS,
  );
  const worktrees = useAgentStore(
    (state) => state.worktreesByProject[projectId] ?? EMPTY_WORKTREES,
  );
  const refreshAgents = useAgentStore((state) => state.refreshAgents);

  // 1F04: worktreeId -> branchName の lookup map
  const worktreeBranchById = useMemo(() => {
    const map = new Map<string, string>();
    for (const worktree of worktrees) {
      map.set(worktree.id, worktree.branchName);
    }
    return map;
  }, [worktrees]);

  useEffect(() => {
    void refreshAgents(projectId);
  }, [projectId, refreshAgents]);

  if (agents.length === 0) {
    return (
      <div className={styles.root}>
        <p className={styles.emptyState} role="status">
          Agent がありません
        </p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <ul className={styles.list} aria-label="Agent list">
        {agents.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          const branchName = agent.activeWorktreeId
            ? (worktreeBranchById.get(agent.activeWorktreeId) ??
              agent.activeWorktreeId)
            : null;
          return (
            <li
              key={agent.id}
              className={
                isSelected
                  ? `${styles.item} ${styles.itemSelected}`
                  : styles.item
              }
            >
              <span className={styles.itemName}>{agent.name}</span>
              <span className={styles.itemStatus} data-status={agent.status}>
                {agent.status}
              </span>
              <span className={styles.itemRole}>{agent.role}</span>
              <span className={styles.itemAdapter}>{agent.adapterType}</span>
              <span className={styles.itemWorktree}>
                {branchName ? `worktree: ${branchName}` : "worktree: —"}
              </span>
              <button
                type="button"
                className={styles.editButton}
                aria-pressed={isSelected}
                aria-label={
                  isSelected
                    ? `${agent.name} の編集を閉じる`
                    : `${agent.name} を編集`
                }
                onClick={() => onSelect(isSelected ? null : agent.id)}
              >
                {isSelected ? "閉じる" : "編集"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default AgentList;
