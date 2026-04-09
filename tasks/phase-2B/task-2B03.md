# task-2B03: agentStore.duplicateAgent(...) 追加

## Phase

2B

## Depends on

- task-2B02

## Goal

`src/store/agentStore.ts` の `AgentState` インターフェースに `duplicateAgent` action を追加し、`agentService.duplicate` を呼び、成功後に `refreshAgents(agent.projectId)` を実行する。エラーは既存パターンと同様 `error` state に詰めて throw する。

## Scope

- `src/store/agentStore.ts`

## Implementation Notes

参照: `agent-docs/agent-duplicate-design.md` §TS service / store

### インターフェース拡張

```ts
export interface AgentState {
  // ...既存...
  agentsByProject: Record<string, Agent[]>;
  worktreesByProject: Record<string, Worktree[]>;
  loading: boolean;
  error: string | null;

  refreshAgents: (projectId: string) => Promise<void>;
  createAgent: (input: AgentCreateInput) => Promise<Agent>;
  updateAgent: (input: AgentUpdateInput) => Promise<Agent>;
  duplicateAgent: (input: AgentDuplicateInput) => Promise<Agent>; // ← 追加

  refreshWorktrees: (projectId: string) => Promise<void>;
  createWorktree: (input: WorktreeCreateInput) => Promise<Worktree>;
  updateWorktree: (input: WorktreeUpdateInput) => Promise<Worktree>;
}
```

### import 拡張

```ts
import type {
  Agent,
  AgentCreateInput,
  AgentDuplicateInput,
  AgentUpdateInput,
  AppErrorPayload,
  Worktree,
  WorktreeCreateInput,
  WorktreeUpdateInput,
} from "../types/bindings";
```

### 実装

`updateAgent` の直後に追加:

```ts
duplicateAgent: async (input) => {
  set({ loading: true, error: null });
  try {
    const agent = await agentService.duplicate(input);
    // 戻り値の projectId で対応 project の一覧を再取得
    await get().refreshAgents(agent.projectId);
    return agent;
  } catch (err) {
    set({ loading: false, error: toErrorMessage(err) });
    throw err;
  }
},
```

### 設計判断

- 楽観更新は行わない (`refreshAgents` で再取得する。Phase 1 の `createAgent` / `updateAgent` と同じ方針)
- 戻り値の `agent.projectId` を使う (input には含まれないため)
- `loading` / `error` state は既存と共有 (専用 dup loading state は持たない)
- 例外時は store の `error` を更新したうえで throw → 上位 (UI) でローカル表示用に再 catch する

### 既存メソッドへの影響

- `refreshAgents` / `createAgent` / `updateAgent` のロジック変更なし
- 既存テスト (Phase 1 にユニットテストはなし) なし

## Out of scope

- UI 統合 (Phase 2D)
- 楽観更新の導入
- store の完全な再設計 (Phase 1 構造を維持)
