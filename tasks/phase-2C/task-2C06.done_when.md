# task-2C06 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/tabs/OverviewTab.tsx` から `useState<string | null>(null)` の selectedAgentId 宣言が削除されている
  - `grep -n 'useState.*selectedAgentId\|selectedAgentId.*useState' src/tabs/OverviewTab.tsx` がヒットしない
- `useUiStore` が import されている
  - `grep -n 'useUiStore' src/tabs/OverviewTab.tsx` でヒット
- `selectedAgentId = useUiStore((state) => state.selectedAgentId)` 相当の selector が存在
- `setSelectedAgentId = useUiStore((state) => state.setSelectedAgentId)` 相当の selector が存在
- Project 切り替え時の useEffect 内で `setSelectedAgentId(null)` を呼ぶロジックが残っている
- 選択中 agent が消失した場合のリセット useEffect が残っている
- AgentList の `onSelect` props に setSelectedAgentId が渡されている
- AgentEditForm の表示条件 (selectedAgent != null) が壊れていない
- 既存の `EMPTY_AGENTS` / `EMPTY_WORKTREES` 定数と Section / SectionProps が変更されていない
- import から `useState` が削除されている (他で使っていなければ)
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
