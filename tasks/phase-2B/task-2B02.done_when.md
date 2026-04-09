# task-2B02 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/services/agentService.ts` に `duplicate:` プロパティが存在する
  - `grep -n 'duplicate:' src/services/agentService.ts` でヒット
- `agentService.duplicate` の型シグネチャが `(input: AgentDuplicateInput) => Promise<Agent>` である
- 内部で `invoke<Agent>("agent_duplicate", { input })` を呼んでいる
  - `grep -n 'agent_duplicate' src/services/agentService.ts` でヒット
- import 文に `AgentDuplicateInput` が含まれている
- 既存の `create` / `listByProject` / `update` メソッドが破壊されていない
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
