# task-2C02 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/features/agents/AgentList.tsx` の import に `AgentStatusBadge` が追加されている
  - `grep -n 'AgentStatusBadge' src/features/agents/AgentList.tsx` で 2 箇所以上ヒット (import + 使用)
- AgentList のレンダリング部に `<AgentStatusBadge status={agent.status}` が含まれる
- 旧コード `<span className={styles.itemStatus} data-status={agent.status}>` が削除されている
  - `grep -n 'itemStatus' src/features/agents/AgentList.tsx` がヒットしない (または `itemStatusCell` のみで残っている)
- 既存の `EMPTY_AGENTS` / `EMPTY_WORKTREES` 定数が残っている (zustand 回帰防止)
- `useEffect` で `refreshAgents(projectId)` を呼ぶロジックが残っている
- selectedAgentId / onSelect props のシグネチャが変更されていない
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
