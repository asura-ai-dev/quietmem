// src/features/agents/AgentStatusBadge.tsx
//
// 4 値 (idle / running / error / needs_input) を視覚的に区別する共通バッジ。
// LeftSidebar / AgentList の双方から再利用される基盤コンポーネント。
//
// 参照:
// - agent-docs/spec.md §4.6 (Agent Status 表示)
// - agent-docs/phase-2-ui-design.md §2 / §AgentStatusBadge

import type { AgentStatus } from "../../types/bindings";
import { AGENT_STATUS_LABELS, isAgentStatus } from "./agentStatus";
import styles from "./AgentStatusBadge.module.css";

interface Props {
  status: string;
  size?: "sm" | "md";
}

/**
 * 4 値 (idle / running / error / needs_input) を視覚的に区別するバッジ。
 *
 * - 色 + ドット + ラベルテキストの 3 要素で状態を表現する
 *   (色のみに依存しないアクセシビリティ要件、spec.md §4.6)
 * - 範囲外値が来た場合は idle 相当の muted バッジでフォールバック
 *   (DB 互換性のためのエスケープハッチ)
 * - role="status" + aria-label でスクリーンリーダー対応
 *
 * 参照: agent-docs/phase-2-ui-design.md §2
 */
function AgentStatusBadge({ status, size = "md" }: Props) {
  const known = isAgentStatus(status);
  const variant: AgentStatus = known ? (status as AgentStatus) : "idle";
  const label = known ? AGENT_STATUS_LABELS[variant] : status;

  const className = [
    styles.badge,
    styles[`badge_${variant}`],
    styles[`size_${size}`],
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span
      className={className}
      data-status={variant}
      role="status"
      aria-label={`status: ${label}`}
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </span>
  );
}

export default AgentStatusBadge;
