# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo check
```

## チェック項目

- `src-tauri/src/commands/agent.rs` に `agent_create`, `agent_list_by_project`, `agent_update` の 3 関数がある
- 各関数に `#[tauri::command]` が付いている
- `agent_update` の引数 `AgentUpdateInput` に `active_worktree_id` フィールドがある
- Rust のコマンド属性または引数名により、フロントエンドから `projectId` (camelCase) で呼び出せる
- 各関数が `db::repo::agent::*` を呼び出す
- `cargo check` がエラーなし
