# Task 1C03: Tauri commands - agent

## Objective

Agent の CRUD を Tauri commands として公開する。`active_worktree_id` の更新もこの command 経由で可能にする。

## Scope

- `src-tauri/src/commands/agent.rs`
  - `#[tauri::command] pub fn agent_create(state, input: AgentCreateInput) -> AppResult<Agent>`
  - `#[tauri::command] pub fn agent_list_by_project(state, project_id: String) -> AppResult<Vec<Agent>>`
  - `#[tauri::command] pub fn agent_update(state, input: AgentUpdateInput) -> AppResult<Agent>`
- DTO は `domain::agent::*` を use
- `agent_list_by_project` の引数は camelCase を維持するため Rust 側引数名は `project_id` で良い (Tauri v2 は自動で snake → camel 変換するため、フロント側は `{ projectId }` で呼ぶ)
  - 注: Tauri v2 の挙動に合わせる。もし自動変換が無い環境なら `#[tauri::command(rename_all = "camelCase")]` 属性を付与

## Implementation Notes

- 参照: `agent-docs/tauri-commands.md`
- `agent_update` で `active_worktree_id` を更新できることが受け入れ条件の 1 つ (spec.md §5.1)
- Phase 1 では専用コマンド `agent_set_active_worktree` は作らず `agent_update` に集約する (spec.md §2.2 の括弧書き)
- コマンドの引数名はフロントエンドの invoke 呼び出しと一致させる必要があるので、`agent_list_by_project` のテストは手動検証で OK (Phase 1C では Rust 側の型整合のみ確認)

## Depends On

- task-1C02
