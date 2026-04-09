# task-2C02: AgentList の status 表示を AgentStatusBadge に置換

## Phase

2C

## Depends on

- task-2C01

## Goal

`src/features/agents/AgentList.tsx` の各行で `<span data-status>` で raw 表示している status を、共通 `AgentStatusBadge` コンポーネントに置き換える。LeftSidebar 統合 (task-2C05) と同じ視覚言語を保証する。

## Scope

- `src/features/agents/AgentList.tsx` (status 表示部の差し替え)
- `src/features/agents/AgentList.module.css` (不要になった `.itemStatus` の削除 / 残置のいずれか)

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §2

### 変更点

#### 現状

```tsx
<span className={styles.itemStatus} data-status={agent.status}>
  {agent.status}
</span>
```

#### 変更後

```tsx
<AgentStatusBadge status={agent.status} size="md" />
```

### import 追加

```tsx
import AgentStatusBadge from "./AgentStatusBadge";
```

### CSS 整理

- `styles.itemStatus` が不要になるなら削除する
- ただし、grid layout 等で `.itemStatus` のセル幅を確保していた場合、AgentStatusBadge をラップする `<div className={styles.itemStatusCell}>` を残してもよい
- 視覚的に列幅が崩れないように調整する

### 行レイアウト維持

既存の `.item` (li) は以下の order で並んでいる:

1. itemName
2. itemStatus (← AgentStatusBadge に置換)
3. itemRole
4. itemAdapter
5. itemWorktree
6. editButton

この order と spacing は維持する。

### 既存挙動の維持

- AgentList の `EMPTY_AGENTS` / `EMPTY_WORKTREES` constant は変更しない (Phase 1F の zustand 回帰防止)
- `useEffect` の refreshAgents 呼び出しは変更しない
- 編集ボタンの onSelect ロジックは変更しない (uiStore 切り替えは task-2C06 で行う)
- selectedAgentId / onSelect props のシグネチャは変更しない (本チケットでは)

### 視覚確認

- 既存の status 文字列が badge に変わることを確認
- `idle` (muted) / `running` (sage) / `error` (red) / `needs_input` (amber) が視覚的に区別される
- 範囲外値 (legacy DB データ) が来ても idle 相当でフォールバックされる

## Out of scope

- LeftSidebar の Agents セクション差し替え (task-2C05)
- selectedAgentId の uiStore 化 (task-2C06)
- 複製ボタンの追加 (task-2D02)
- AgentList 自体の構造変更 (列追加等)
- AgentList 行内の編集機能変更
