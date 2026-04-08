# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/worktrees/WorktreeList.tsx` が存在
- `src/features/worktrees/WorktreeCreateForm.tsx` が存在
- WorktreeList が `refreshWorktrees(projectId)` をマウント時に呼ぶ
- WorktreeCreateForm が `branchName`, `path`, `baseBranch`, `status` を扱い、`agentStore.createWorktree` を呼ぶ
- OverviewTab に Worktrees セクションが表示される
- `pnpm tsc --noEmit` / `pnpm build` がエラーなし
