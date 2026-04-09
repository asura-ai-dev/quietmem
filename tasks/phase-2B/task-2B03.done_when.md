# task-2B03 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/store/agentStore.ts` の `AgentState` インターフェースに `duplicateAgent: (input: AgentDuplicateInput) => Promise<Agent>` フィールドが追加されている
  - `grep -n 'duplicateAgent' src/store/agentStore.ts` で 2 箇所以上ヒット (interface + implementation)
- import 文に `AgentDuplicateInput` が含まれている
- `useAgentStore` の create 関数内で `duplicateAgent` が実装されている
- 実装内で `agentService.duplicate(input)` が呼ばれている
- 実装内で 成功後に `get().refreshAgents(agent.projectId)` が呼ばれている
- 実装内で例外時に `set({ loading: false, error: toErrorMessage(err) })` が呼ばれ、`throw err` で再 throw している
- 既存の `refreshAgents` / `createAgent` / `updateAgent` のシグネチャと挙動が変更されていない
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
