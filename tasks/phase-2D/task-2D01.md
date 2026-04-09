# task-2D01: AgentDuplicateConfirm コンポーネント新規作成

## Phase

2D

## Depends on

- task-2C01
- task-2B03

## Goal

Agent を複製する際の確認 inline ダイアログ `AgentDuplicateConfirm` を新規作成する。引き継がれる項目 / 引き継がれない項目を明示し、ユーザーに「memory を引き継がない / status は idle で開始 / active worktree は未割当」を理解させた上でキャンセル / 実行を選ばせる。Modal ではなく inline 領域として AgentEditForm 内に展開される。

## Scope

- `src/features/agents/AgentDuplicateConfirm.tsx` (新規)
- `src/features/agents/AgentDuplicateConfirm.module.css` (新規)

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §4 複製ボタン + 確認 UI

### コンポーネント仕様

```tsx
// src/features/agents/AgentDuplicateConfirm.tsx

import { useEffect, useId } from "react";
import type { Agent } from "../../types/bindings";
import styles from "./AgentDuplicateConfirm.module.css";

interface Props {
  agent: Agent;
  loading?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Agent の複製確認 inline ダイアログ。
 *
 * - 引き継がれる項目を明示
 * - 引き継がれない項目 (memory / active worktree / status) を警告色で明示
 * - キャンセル / 実行の 2 ボタン
 * - ESC キーでキャンセル (アクセシビリティ)
 *
 * 参照: agent-docs/phase-2-ui-design.md §4
 */
function AgentDuplicateConfirm({
  agent,
  loading,
  errorMessage,
  onCancel,
  onConfirm,
}: Props) {
  const headingId = useId();
  const descId = useId();

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [onCancel]);

  return (
    <aside
      className={styles.root}
      role="alertdialog"
      aria-modal="false"
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <header className={styles.header}>
        <h4 id={headingId} className={styles.title}>
          Agent を複製しますか?
        </h4>
      </header>
      <div id={descId} className={styles.body}>
        <p className={styles.intro}>
          <strong>{agent.name}</strong> をもとに新しい Agent を作成します。
        </p>
        <dl className={styles.list}>
          <dt className={styles.copy}>引き継がれる項目</dt>
          <dd>
            name (末尾に "(copy)")、role、adapter type、prompt path、config path
          </dd>
          <dt className={styles.skip}>引き継がれない項目</dt>
          <dd>
            Agent 固有の memory (raw / curated)、active worktree、status (idle
            で開始)
          </dd>
        </dl>
        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}
      </div>
      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.cancel}
          onClick={onCancel}
          disabled={loading}
        >
          キャンセル
        </button>
        <button
          type="button"
          className={styles.confirm}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "複製中…" : "複製を実行"}
        </button>
      </footer>
    </aside>
  );
}

export default AgentDuplicateConfirm;
```

### CSS (AgentDuplicateConfirm.module.css)

```css
.root {
  margin-top: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-amber-500);
  background: var(--bg-surface);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  margin: 0;
  color: var(--fg-primary);
  font-size: var(--font-size-base);
  font-weight: 600;
}

.body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--fg-primary);
}

.intro {
  margin: 0;
}

.list {
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: var(--space-3);
  row-gap: var(--space-1);
}

.list dt {
  font-weight: 600;
}
.list dd {
  margin: 0;
  color: var(--fg-muted);
}

.copy {
  color: var(--accent-primary);
}
.skip {
  color: var(--accent-attention);
}

.error {
  margin: 0;
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

.cancel,
.confirm {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.cancel {
  background: var(--bg-surface-2);
  color: var(--fg-primary);
}
.cancel:hover:not(:disabled) {
  background: var(--bg-app);
}

.confirm {
  background: var(--color-amber-500);
  color: var(--color-gray-900);
  border-color: var(--color-amber-700);
  font-weight: 600;
}
.confirm:hover:not(:disabled) {
  background: var(--color-amber-300);
}

.cancel:disabled,
.confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### 設計判断

- modal portal を使わない → grid layout を破壊せずフォーム内に閉じる
- ESC キーは `useEffect` + `window.addEventListener` で検出 (cleanup 必須)
- `role="alertdialog"` は inline でも使える (`aria-modal="false"`)
- `aria-labelledby` / `aria-describedby` で headingId / descId を指定し、useId で id を生成 (Phase 1 既存パターン)
- 引き継がれる / 引き継がれない を `<dl>` で 2 列に並べることで対比を強調
- 警告色は `--accent-attention` (amber) と `--color-danger` (red) を使い分け
  - amber: 「注意してね」レベル
  - red: エラーメッセージ専用
- raw 色値は使わない (tokens.css の alias 経由)

### 仕様文言の確認

`agent-docs/spec.md` §4.5 「引き継がれない項目: Agent 固有の memory (raw / curated)、active worktree、status (idle で開始)」と完全に一致させる。文言を勝手に変えない。

## Out of scope

- AgentEditForm への組み込み (task-2D02)
- AgentList 行への複製ボタン追加 (Phase 2 では editForm 側必須、List 側は任意のため省略)
- modal portal の導入
- フォーカストラップ実装 (Phase 2 では基本的な ESC 対応のみ)
- Smoke 通し (task-2D03)
