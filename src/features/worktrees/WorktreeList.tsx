import { useEffect } from "react";
import { useAgentStore } from "../../store/agentStore";
import type { Worktree } from "../../types/bindings";
import styles from "./WorktreeList.module.css";

// Stable empty-array constant. See AgentList.tsx for the rationale.
const EMPTY_WORKTREES: readonly Worktree[] = [];

/**
 * WorktreeList
 *
 * 指定 projectId 配下の Worktree 一覧を表示する。
 * マウント時および projectId 変更時に
 * `agentStore.refreshWorktrees(projectId)` を呼び、
 * `worktreesByProject[projectId]` を `<ul>` で列挙する。
 *
 * 各項目は branchName / path / baseBranch / status / agentId を
 * 1 項目内に配置した静的な行 (<li>) で表現する。worktree 側で選択状態は
 * 持たない (Agent の activeWorktreeId 更新は 1F04 の AgentEditForm 側から)。
 *
 * 空状態は「Worktree がありません」の静かなメッセージを表示する
 * (ProjectList / AgentList と揃えた amber ドット付き muted italic)。
 *
 * 参照:
 * - agent-docs/ui-shell.md (Overview タブ内構成 / デザイントークン)
 * - agent-docs/tauri-commands.md (Worktree DTO)
 * - tasks/phase-1F/task-1F03.md
 * - spec.md §4.7 / §5.1 / §9 (Worktree 一覧の受け入れ条件)
 */

interface WorktreeListProps {
  projectId: string;
}

function WorktreeList({ projectId }: WorktreeListProps) {
  const worktrees = useAgentStore(
    (state) => state.worktreesByProject[projectId] ?? EMPTY_WORKTREES,
  );
  const refreshWorktrees = useAgentStore((state) => state.refreshWorktrees);

  useEffect(() => {
    void refreshWorktrees(projectId);
  }, [projectId, refreshWorktrees]);

  if (worktrees.length === 0) {
    return (
      <div className={styles.root}>
        <p className={styles.emptyState} role="status">
          Worktree がありません
        </p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <ul className={styles.list} aria-label="Worktree list">
        {worktrees.map((worktree) => (
          <li key={worktree.id} className={styles.item}>
            <span className={styles.itemBranch}>{worktree.branchName}</span>
            <span className={styles.itemStatus} data-status={worktree.status}>
              {worktree.status}
            </span>
            <span className={styles.itemBase}>base: {worktree.baseBranch}</span>
            <span className={styles.itemAgent}>
              {worktree.agentId ? `agent: ${worktree.agentId}` : "agent: —"}
            </span>
            <span className={styles.itemPath}>{worktree.path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WorktreeList;
