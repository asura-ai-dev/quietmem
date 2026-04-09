# task-2B01: bindings.ts に AgentStatus / AgentDuplicateInput 追加 + 定数モジュール

## Phase

2B

## Depends on

- task-2A06

## Goal

`src/types/bindings.ts` に `AgentStatus` 型ユニオンと `AgentDuplicateInput` 型を追加し、Agent 関連の型を Phase 2 backend と整合させる。さらに status の有効値・表示ラベルを定数として `src/features/agents/agentStatus.ts` に集約する。

## Scope

- `src/types/bindings.ts` (型追加)
- `src/features/agents/agentStatus.ts` (新規定数モジュール)

## Implementation Notes

参照: `agent-docs/phase-2-status-enum.md` §TS 側設計, `agent-docs/agent-duplicate-design.md` §TS service / store

### bindings.ts への追加

`AgentStatus` 型をファイル内の Agent 関連セクション直前に追加:

```ts
/**
 * Agent.status の有効値ホワイトリスト型。
 *
 * Rust 側 `domain::agent::AGENT_STATUS_VALUES` と 1:1 で対応する。
 * - "idle":         初期状態 / 静止中
 * - "running":      実行中
 * - "error":        エラー停止中
 * - "needs_input":  ユーザー入力待ち
 *
 * 参照: agent-docs/phase-2-status-enum.md
 */
export type AgentStatus = "idle" | "running" | "error" | "needs_input";
```

### Agent / AgentCreateInput / AgentUpdateInput の型強化

```ts
export interface Agent {
  id: string;
  projectId: string;
  name: string;
  role: string;
  adapterType: string;
  promptPath: string | null;
  configPath: string | null;
  // 前方互換のためユニオンで許容 (DB に既存範囲外値が残るケース対策)
  status: AgentStatus | string;
  activeWorktreeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCreateInput {
  projectId: string;
  name: string;
  role: string;
  adapterType: string;
  promptPath?: string | null;
  configPath?: string | null;
  // 厳格化: 自由文字列は受け付けない
  status?: AgentStatus;
}

export interface AgentUpdateInput {
  id: string;
  name?: string;
  role?: string;
  adapterType?: string;
  promptPath?: string | null;
  configPath?: string | null;
  status?: AgentStatus;
  activeWorktreeId?: string | null;
}
```

### AgentDuplicateInput の追加

`AgentUpdateInput` の直後に追加:

```ts
/**
 * `agent_duplicate` Tauri command の入力。
 *
 * - sourceAgentId: 元 Agent の id
 * - name: 省略時は Rust 側で `<元 name> (copy)` を生成する
 *
 * 参照: agent-docs/agent-duplicate-design.md
 */
export interface AgentDuplicateInput {
  sourceAgentId: string;
  name?: string | null;
}
```

### 新規ファイル: src/features/agents/agentStatus.ts

```ts
// src/features/agents/agentStatus.ts
//
// Agent status の有効値リストと表示ラベルを集約する。
// Rust 側 `domain::agent::AGENT_STATUS_VALUES` の TS ミラー。
//
// 参照: agent-docs/phase-2-status-enum.md

import type { AgentStatus } from "../../types/bindings";

/**
 * Agent status の有効値リスト。順序は UI の <select> option 順を兼ねる。
 */
export const AGENT_STATUS_VALUES = [
  "idle",
  "running",
  "error",
  "needs_input",
] as const satisfies readonly AgentStatus[];

/**
 * status 文字列をユーザー向け表示用ラベルにマップする。
 * needs_input は表示時にスペース入りにする ("needs input")。
 */
export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  idle: "idle",
  running: "running",
  error: "error",
  needs_input: "needs input",
};

/**
 * 任意の文字列が AgentStatus に該当するか判定する。
 * 範囲外の場合は false (DB 互換性のフォールバック判定に使う)。
 */
export const isAgentStatus = (value: string): value is AgentStatus =>
  (AGENT_STATUS_VALUES as readonly string[]).includes(value);
```

### コンパイルチェック

- `pnpm tsc --noEmit` が exit 0 (既存コードが影響を受けないことを確認)
- 既存 `agent.status === "idle"` 等の文字列比較は `AgentStatus | string` ユニオンの下でも有効

### 既存コードへの影響

- 既存 `AgentCreateForm.tsx` の `status: status.length > 0 ? status : DEFAULT_STATUS` の `status` は `string` 型なので `AgentStatus` への代入で型エラーになる可能性がある
- task-2C03 で本格対応するが、本チケット (2B01) では「型エラーが出ない」ことだけを確認すればよい
- 必要に応じて `AgentCreateForm` 内で `status as AgentStatus` の暫定 cast を入れて build を通す。本格修正は Phase 2C で実施する旨をコメントで明示する

ただし `tsc --noEmit` に明確に失敗するなら、最小の interim cast (1 行) を `AgentCreateForm.tsx` に入れて通すこと。設計判断は Generator 側の裁量。

## Out of scope

- `agentService.duplicate()` の追加 (task-2B02)
- `agentStore.duplicateAgent()` の追加 (task-2B03)
- `tokens.css` 変更 (task-2B04)
- UI コンポーネントの本格修正 (Phase 2C)
- Rust 側変更 (Phase 2A で完了済)
