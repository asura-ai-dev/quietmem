# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/agents/AgentEditForm.tsx` が存在
- `activeWorktreeId` を `<select>` で Worktree 一覧から選択できる
- submit で `agentStore.updateAgent` が呼ばれる
- 保存成功後に `refreshAgents` が呼ばれる
- 空文字選択で `activeWorktreeId: null` として送る
- AgentList から「編集」で AgentEditForm が開ける
- `pnpm tsc --noEmit` / `pnpm build` がエラーなし
