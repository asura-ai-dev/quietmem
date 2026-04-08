# Task 1D01: TypeScript 型ミラー (bindings.ts)

## Objective

Rust 側の DTO (`domain::*`) と 1 対 1 で対応する TypeScript 型を `src/types/bindings.ts` に手動で定義する。

## Scope

- `src/types/bindings.ts`
  - `AppErrorPayload` インターフェース (`code`, `message`)
  - `Project`, `ProjectCreateInput`, `ProjectUpdateInput`
  - `Agent`, `AgentCreateInput`, `AgentUpdateInput`
  - `Worktree`, `WorktreeCreateInput`, `WorktreeUpdateInput`
  - すべて camelCase フィールド名 (Rust 側の `rename_all = "camelCase"` と一致)

## Implementation Notes

- 参照: `agent-docs/tauri-commands.md` (TypeScript 型定義セクション)
- `Agent.activeWorktreeId` は `string | null`
- `Agent.promptPath` / `configPath` は `string | null`
- `Worktree.agentId` は `string | null`
- Update 系のオプショナルフィールドは `?:` で表現
- 型以外のロジックは書かない (`bindings.ts` は純粋な型定義ファイル)
- export はすべて `export interface` か `export type`

## Depends On

- task-1A02
- task-1C04 (Rust DTO 確定のため)
