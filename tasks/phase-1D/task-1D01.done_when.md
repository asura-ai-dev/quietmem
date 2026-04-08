# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
```

## チェック項目

- `src/types/bindings.ts` が存在
- `Project`, `ProjectCreateInput`, `ProjectUpdateInput` が export されている
- `Agent`, `AgentCreateInput`, `AgentUpdateInput` が export されている
- `Worktree`, `WorktreeCreateInput`, `WorktreeUpdateInput` が export されている
- `AppErrorPayload` が export されている
- `Agent.activeWorktreeId` が `string | null` 型
- すべてのフィールド名が camelCase
- `pnpm tsc --noEmit` がエラーなし
