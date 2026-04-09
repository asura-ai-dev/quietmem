# task-2C01: AgentStatusBadge コンポーネント新規作成

## Phase

2C

## Depends on

- task-2B04

## Goal

`src/features/agents/AgentStatusBadge.tsx` (および同名 module.css) を新規作成し、4 値 (`idle` / `running` / `error` / `needs_input`) を視覚的に区別する共通バッジコンポーネントを提供する。LeftSidebar / AgentList の双方から再利用される基盤。

## Scope

- `src/features/agents/AgentStatusBadge.tsx` (新規)
- `src/features/agents/AgentStatusBadge.module.css` (新規)

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §2 / §AgentStatusBadge コンポーネント

### コンポーネント仕様

```tsx
// src/features/agents/AgentStatusBadge.tsx

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
```

### CSS 仕様 (AgentStatusBadge.module.css)

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-family: var(--font-mono);
  border: 1px solid transparent;
  white-space: nowrap;
  line-height: 1.4;
}

.size_sm {
  font-size: 11px;
  padding: 1px var(--space-1);
}

.size_md {
  font-size: var(--font-size-sm);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  flex: 0 0 auto;
}

.label {
  letter-spacing: 0.02em;
}

.badge_idle {
  color: var(--fg-muted);
  background: transparent;
  border-color: var(--border-subtle);
}

.badge_running {
  color: var(--color-sage-50);
  background: var(--color-sage-700);
  border-color: var(--color-sage-500);
}

.badge_error {
  color: var(--color-gray-50);
  background: var(--color-danger-bg);
  border-color: var(--color-danger);
}

.badge_needs_input {
  color: var(--color-gray-900);
  background: var(--color-amber-300);
  border-color: var(--color-amber-500);
}
```

### 設計判断

- raw 色値は使わない (`tokens.css` の semantic alias と raw パレットのみ参照)
- バリアント名 (`badge_needs_input`) はアンダースコア区切りで固定 (TS 側 enum 値と一致)
- size は `sm` / `md` の 2 種類のみ。LeftSidebar は `sm`、AgentList は `md` を使う想定
- フォールバック動作: 範囲外文字列は idle スタイルで描画 + ラベルは元の文字列をそのまま表示 (デバッグ可視性)
- `data-status` 属性は CSS セレクタや E2E テストの hook に使えるよう残す

### import 順序

- React は不要 (この component は state を持たない)
- bindings.ts から `AgentStatus` 型のみ
- agentStatus.ts から `AGENT_STATUS_LABELS`, `isAgentStatus`

## Out of scope

- AgentList への組み込み (task-2C02)
- LeftSidebar への組み込み (task-2C05)
- バッジサイズの追加 (lg 等) は不要
- アニメーション (`running` で点滅させる等) は不要
- icon ライブラリ導入 (Phase 1 ポリシーで使わない)
