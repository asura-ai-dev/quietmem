# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
```

## チェック項目

- `src/store/projectStore.ts` が存在し、`projects`, `selectedProjectId`, `loading`, `error` と `refresh`, `create`, `update`, `selectProject` を持つ
- `src/store/agentStore.ts` が存在し、`agentsByProject`, `worktreesByProject` と 6 つの action (refreshAgents, refreshWorktrees, createAgent, updateAgent, createWorktree, updateWorktree) を持つ
- 各 action は `src/services/*` を呼び出す
- エラー catch 時に `error` state が更新される
- `pnpm tsc --noEmit` がエラーなし
