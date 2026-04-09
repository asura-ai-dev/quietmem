# task-2C05: LeftSidebar Agents セクションを実 Agent 一覧に置換

## Phase

2C

## Depends on

- task-2B05
- task-2C01

## Goal

`src/shell/LeftSidebar.tsx` の Agents セクションを placeholder から実 Agent 一覧に切り替える。選択中 Project 配下の Agent を `agentStore` から取得し、各行に name + `AgentStatusBadge` を表示する。click で `uiStore.setSelectedAgentId(id)` を呼び、OverviewTab の編集フォームと連動させる。

## Scope

- `src/shell/LeftSidebar.tsx`
- `src/shell/LeftSidebar.module.css` (Agent 行 + status バッジ用のクラス追加)

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §1 LeftSidebar Agents セクション

### 全体構造の差分

#### 現状

```tsx
<section className={styles.section} aria-label="Agents">
  <h2 className={styles.sectionLabel}>Agents</h2>
  {selectedProjectId === null ? (
    <p className={styles.emptyState}>Project を選択してください</p>
  ) : (
    <p className={styles.placeholder}>Agent 一覧は後続タスクで接続します</p>
  )}
</section>
```

#### 変更後

```tsx
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
```

### import / store 拡張

```tsx
import { useEffect } from "react";
import { useAgentStore } from "../store/agentStore";
import { useUiStore } from "../store/uiStore";
import AgentStatusBadge from "../features/agents/AgentStatusBadge";
import type { Agent } from "../types/bindings";
import styles from "./LeftSidebar.module.css";

const EMPTY_AGENTS: readonly Agent[] = [];
```

### selector / effect

```tsx
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

  // ... return JSX ...
}
```

### ZUSTAND 回帰防止

- `EMPTY_AGENTS` を component 外の module 定数として宣言する (Phase 1F task-1F06 と同じパターン)
- selector 内で `?? EMPTY_AGENTS` を使うことで、agentsByProject に key がない場合でも安定参照を返す
- これを怠ると `Maximum update depth exceeded` で Workspace がブランクになる回帰が再発するので注意

### CSS 追加 (LeftSidebar.module.css)

```css
.agentList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.agentItemButton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: transparent;
  color: var(--fg-primary);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
}

.agentItemButton:hover {
  background: var(--bg-surface);
}

.agentItemButtonSelected {
  background: var(--bg-surface);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.agentItemName {
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: var(--space-2);
}

.agentItemBadge {
  flex: 0 0 auto;
}
```

### 既存スタイルの維持

- Projects セクションのスタイル (`.section`, `.sectionLabel`, `.list`, `.itemButton`, `.itemButtonSelected`, `.itemName`, `.itemSlug`, `.emptyState`) は変更しない
- 既存の `.placeholder` クラスは Agents 用途では不要になるが、削除はオプション (他で使われているかは generator が grep で確認)

### 注意

- `refreshAgents` は OverviewTab からも呼ばれているが、LeftSidebar 単体でも安全に呼ぶ。重複しても agentStore 側でフラグ管理されており問題ない
- selectedProjectId が null のときは `void refreshAgents` を呼ばない (effect 内でガード)
- Project 未選択 → 選択 → 別 Project 選択の遷移で正しく一覧が差し替わることを確認
- click で同じ agent を二度押しても toggle にしない (選択維持)。toggle は AgentList の編集ボタンの責務

## Out of scope

- selectedAgentId の OverviewTab 側差し替え (task-2C06)
- 複製ボタン (task-2D02)
- AgentList (Overview) との統合テスト (Phase 2D Smoke)
- アコーディオン化 (Phase 2 では平坦リスト)
- ドラッグ&ドロップでの並び替え
