# task-2A05: agent_duplicate Tauri command + invoke_handler 登録

## Phase

2A

## Depends on

- task-2A04

## Goal

`commands/agent.rs` に薄い command 関数 `agent_duplicate` を追加し、`lib.rs` の `tauri::generate_handler!` に登録してフロントから invoke 可能にする。

## Scope

- `src-tauri/src/commands/agent.rs`
- `src-tauri/src/lib.rs`

## Implementation Notes

参照: `agent-docs/agent-duplicate-design.md` §Tauri command 層

### commands/agent.rs に追加

ファイル末尾の既存 `agent_update` の下に追加:

```rust
/// Agent を複製する。
///
/// 元 Agent の `role` / `adapter_type` / `prompt_path` / `config_path` を引き継ぎ、
/// 新 `id` / `created_at` / `updated_at` を採番する。
/// `status` は強制的に `idle`、`active_worktree_id` は `null` で開始する。
///
/// memory テーブル (`raw_memory_entries` / `curated_memories`) には
/// 一切書き込みを行わない (= 「memory 非引継ぎ」の実装)。
///
/// 参照: agent-docs/agent-duplicate-design.md
#[tauri::command(rename_all = "camelCase")]
pub fn agent_duplicate(
    state: State<'_, AppState>,
    input: AgentDuplicateInput,
) -> AppResult<Agent> {
    state.with_conn(|conn| db::repo::agent::duplicate(conn, input))
}
```

### import 拡張

ファイル先頭の use を拡張:

```rust
use crate::domain::agent::{Agent, AgentCreateInput, AgentDuplicateInput, AgentUpdateInput};
```

### lib.rs invoke_handler 登録

現状:

```rust
.invoke_handler(tauri::generate_handler![
    commands::project::project_create,
    commands::project::project_list,
    commands::project::project_update,
    commands::agent::agent_create,
    commands::agent::agent_list_by_project,
    commands::agent::agent_update,
    commands::worktree::worktree_create,
    commands::worktree::worktree_list_by_project,
    commands::worktree::worktree_update,
])
```

`commands::agent::agent_update` の直後に `commands::agent::agent_duplicate` を追加:

```rust
.invoke_handler(tauri::generate_handler![
    commands::project::project_create,
    commands::project::project_list,
    commands::project::project_update,
    commands::agent::agent_create,
    commands::agent::agent_list_by_project,
    commands::agent::agent_update,
    commands::agent::agent_duplicate,   // ← 追加
    commands::worktree::worktree_create,
    commands::worktree::worktree_list_by_project,
    commands::worktree::worktree_update,
])
```

### バリデーション / DTO 変換

- command 自体は薄いアダプタ。バリデーションは repo 層 (`duplicate` 関数) に委譲する
- `state.with_conn` ヘルパで lock + dispatch (Phase 1 既存パターン)
- エラーは `AppResult<Agent>` で透過 (上位で `AppErrorPayload` にシリアライズされる)

### ビルドチェック

`cargo build` が通り、handler 登録も問題なく compile することを確認する。

## Out of scope

- フロント側 service / store (task-2B02 / 2B03)
- 単体テスト (task-2A04 で repo 層は担保済。command 層の単体テストは Phase 2 では追加しない)
- UI 統合 (Phase 2D)
- Phase 1 既存 commands の再構成
