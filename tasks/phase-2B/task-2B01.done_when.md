# task-2B01 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem
pnpm tsc --noEmit
pnpm build
```

## チェック項目

- `src/types/bindings.ts` に `export type AgentStatus = "idle" | "running" | "error" | "needs_input"` が存在
  - `grep -n 'export type AgentStatus' src/types/bindings.ts` でヒット
- `src/types/bindings.ts` の `Agent.status` の型が `AgentStatus | string` (またはより厳しいユニオン) に変更されている
- `src/types/bindings.ts` の `AgentCreateInput.status` の型が `AgentStatus` (optional) になっている
- `src/types/bindings.ts` の `AgentUpdateInput.status` の型が `AgentStatus` (optional) になっている
- `src/types/bindings.ts` に `export interface AgentDuplicateInput` が存在
  - `sourceAgentId: string` フィールドあり
  - `name?: string | null` フィールドあり
- `src/features/agents/agentStatus.ts` ファイルが新規作成されている
- `agentStatus.ts` に `AGENT_STATUS_VALUES` 定数 (4 要素) が export されている
- `agentStatus.ts` に `AGENT_STATUS_LABELS` (Record<AgentStatus, string>) が export されている
  - `needs_input` のラベル値が `"needs input"` (スペース入り)
- `agentStatus.ts` に `isAgentStatus` 関数が export されている
- `pnpm tsc --noEmit` が exit 0
- `pnpm build` が success
- 既存の `AgentList.tsx` / `AgentCreateForm.tsx` / `AgentEditForm.tsx` / `OverviewTab.tsx` のコンパイルが壊れていない (interim cast 含めて build 通過)
