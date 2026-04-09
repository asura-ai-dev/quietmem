# task-2C06: OverviewTab の selectedAgentId を uiStore に切り替え

## Phase

2C

## Depends on

- task-2B05

## Goal

`src/tabs/OverviewTab.tsx` の `selectedAgentId` ローカル state を `uiStore.selectedAgentId` に置き換える。これにより LeftSidebar (task-2C05) の Agent 行クリックと Overview タブの編集フォーム表示が同一の真実源で連動する。Project 切り替え時のリセットは uiStore の action 経由に変更する。

## Scope

- `src/tabs/OverviewTab.tsx`

## Implementation Notes

参照: `agent-docs/phase-2-ui-design.md` §6 selectedAgentId の昇格

### 変更点

#### import 拡張

```tsx
import { useUiStore } from "../store/uiStore";
```

#### useState 削除

現状:

```tsx
const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
```

削除して、uiStore selector に置換:

```tsx
const selectedAgentId = useUiStore((state) => state.selectedAgentId);
const setSelectedAgentId = useUiStore((state) => state.setSelectedAgentId);
```

#### Project 切り替え時のリセット

現状:

```tsx
useEffect(() => {
  setSelectedAgentId(null);
}, [selectedProjectId]);
```

これは uiStore action を呼ぶ形に書き換えるが、ロジックは同じ:

```tsx
useEffect(() => {
  setSelectedAgentId(null);
}, [selectedProjectId, setSelectedAgentId]);
```

(setSelectedAgentId は zustand の action なので識別子は安定しているが、念のため依存配列に含める)

#### 選択中 agent が消失した場合のリセット

現状:

```tsx
useEffect(() => {
  if (
    selectedAgentId &&
    !agentsForProject.some((a) => a.id === selectedAgentId)
  ) {
    setSelectedAgentId(null);
  }
}, [selectedAgentId, agentsForProject]);
```

書き換え:

```tsx
useEffect(() => {
  if (
    selectedAgentId &&
    !agentsForProject.some((a) => a.id === selectedAgentId)
  ) {
    setSelectedAgentId(null);
  }
}, [selectedAgentId, agentsForProject, setSelectedAgentId]);
```

#### useState 不要なので import から削除

```tsx
import { useEffect, type ReactNode } from "react";
```

(`useState` を削除)

### 既存挙動の維持

- AgentList / AgentCreateForm / AgentEditForm の props インターフェースは変更しない
- AgentList の `onSelect` callback は引き続き `setSelectedAgentId` を渡す (uiStore 経由)
- Section / SectionProps / placeholder UI は変更しない
- agentsForProject / worktreesForProject の selector + EMPTY_AGENTS / EMPTY_WORKTREES は変更しない (zustand 回帰防止)

### 動作確認

- Project A 選択 → Agent X 編集ボタン押下 → editForm 表示 → Project B 切り替え → editForm 消える
- LeftSidebar の Agent 行 click → OverviewTab の editForm が同 agent で開く
- AgentList の編集ボタン click → LeftSidebar の同 agent もハイライト

(上記は手動 Smoke は task-2D03 で実施。本チケットでは pnpm tsc + pnpm build まで)

## Out of scope

- LeftSidebar 側の差し替え (task-2C05、本チケットと並列でも可だが先後関係がある)
- 複製ボタン (task-2D02)
- AgentList の編集ボタンロジック変更
