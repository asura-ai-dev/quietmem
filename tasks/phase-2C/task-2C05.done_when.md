# task-2C05 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/shell/LeftSidebar.tsx` の Agents セクションから placeholder テキスト `Agent 一覧は後続タスクで接続します` が削除されている
  - `grep -n '後続タスクで接続' src/shell/LeftSidebar.tsx` がヒットしない
- `useAgentStore` から `agentsByProject` を selector で取得している
- selector で `?? EMPTY_AGENTS` パターンを使い、`EMPTY_AGENTS` が module スコープ定数として宣言されている
  - `grep -n 'EMPTY_AGENTS' src/shell/LeftSidebar.tsx` で 2 箇所以上ヒット
- `useUiStore` から `selectedAgentId` と `setSelectedAgentId` を取得している
- `useEffect` で `selectedProjectId` 変更時に `refreshAgents(selectedProjectId)` を呼ぶ
- Agents セクションが選択中 Project 配下の Agent 一覧を `<ul>` で表示する
- 各 Agent 行に `AgentStatusBadge` (size="sm") が表示される
- 選択中の agent には `aria-pressed="true"` と sage 系ハイライトが付く
- Agent 行 click で `setSelectedAgentId(agent.id)` が呼ばれる
- Project 未選択時は `Project を選択してください` を表示
- Agent が 0 件のときは `Agent がまだありません` を表示
- `LeftSidebar.module.css` に `.agentList`, `.agentItemButton`, `.agentItemButtonSelected`, `.agentItemName`, `.agentItemBadge` (またはそれに相当する) クラスが追加されている
- 既存の Projects セクションのスタイル (`.list` / `.itemButton` 等) が破壊されていない
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
