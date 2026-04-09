# task-2B02: agentService.duplicate(...) 追加

## Phase

2B

## Depends on

- task-2B01

## Goal

`src/services/agentService.ts` に `duplicate` メソッドを追加し、Tauri の `agent_duplicate` command を invoke するラッパーを提供する。

## Scope

- `src/services/agentService.ts`

## Implementation Notes

参照: `agent-docs/agent-duplicate-design.md` §TS service / store

### 追加するメソッド

```ts
import { invoke } from "@tauri-apps/api/core";
import type {
  Agent,
  AgentCreateInput,
  AgentDuplicateInput,
  AgentUpdateInput,
} from "../types/bindings";

const agentService = {
  create: (input: AgentCreateInput): Promise<Agent> =>
    invoke<Agent>("agent_create", { input }),
  listByProject: (projectId: string): Promise<Agent[]> =>
    invoke<Agent[]>("agent_list_by_project", { projectId }),
  update: (input: AgentUpdateInput): Promise<Agent> =>
    invoke<Agent>("agent_update", { input }),
  duplicate: (input: AgentDuplicateInput): Promise<Agent> =>
    invoke<Agent>("agent_duplicate", { input }),
} as const;

export { agentService };
```

### 注意

- 第 2 引数は `{ input }` で統一する (Phase 1 既存の create / update と揃える)
- 戻り値は `Promise<Agent>` (新規作成された Agent)
- service 層は invoke のラッパーに徹する。エラー変換やフォールバック処理は行わず、上位 (store) に投げる
- import 順は既存の `Agent`, `AgentCreateInput`, `AgentUpdateInput` に `AgentDuplicateInput` をアルファベット順 / または定義順で挿入する

### 既存メソッドへの影響

- 既存の `create` / `listByProject` / `update` のシグネチャ変更なし
- `as const` も維持 (型推論のため)

## Out of scope

- store 層 (task-2B03)
- UI 統合 (Phase 2D)
- エラーハンドリング (store 層で対応)
