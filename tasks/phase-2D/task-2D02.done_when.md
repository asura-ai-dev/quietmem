# task-2D02 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/agents/AgentEditForm.tsx` の import に `AgentDuplicateConfirm` が含まれる
- import に `useUiStore` が含まれる
- formHeader 内に「複製」ボタン (`<button>複製</button>` または相当) が追加されている
  - `grep -n '複製' src/features/agents/AgentEditForm.tsx` でヒット
- 複製ボタンに `onClick={handleDuplicateClick}` (または相当) が設定されている
- `useState<boolean>` で `showDuplicate` state が追加されている
- `useState<string | null>` で `dupError` state が追加されている
- `useState<boolean>` で `dupLoading` state が追加されている
- `agentStore.duplicateAgent` を呼び出すロジックが存在する
  - `grep -n 'duplicateAgent' src/features/agents/AgentEditForm.tsx` でヒット
- `setSelectedAgentId(newAgent.id)` で新 Agent を選択中にするロジックが存在
- `showDuplicate === true` のとき `<AgentDuplicateConfirm>` が render される
- AgentDuplicateConfirm に `agent`, `loading`, `errorMessage`, `onCancel`, `onConfirm` の 5 props が渡される
- 既存の useEffect (`agent.id` 変更時の reset) に `setShowDuplicate(false)` / `setDupError(null)` のリセットが追加されている
- `AgentEditForm.module.css` に `.duplicateButton` クラスが追加されている (raw 色値直書きなし)
- 既存の status `<select>` (task-2C04) と Active Worktree `<select>` が破壊されていない
- 既存の通常 submit 処理 (`handleSubmit`) が破壊されていない
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
