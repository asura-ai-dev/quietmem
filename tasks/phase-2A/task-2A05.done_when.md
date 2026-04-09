# task-2A05 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo build
cargo test --lib
cargo clippy -- -D warnings
```

## チェック項目

- `src-tauri/src/commands/agent.rs` に `pub fn agent_duplicate` が存在する
  - `grep -n 'fn agent_duplicate' src-tauri/src/commands/agent.rs` でヒット
- `agent_duplicate` 関数に `#[tauri::command(rename_all = "camelCase")]` が付与されている
- `agent_duplicate` 関数のシグネチャが `(state: State<'_, AppState>, input: AgentDuplicateInput) -> AppResult<Agent>` である
- `agent_duplicate` 関数本体で `db::repo::agent::duplicate(conn, input)` が呼ばれている
- `src-tauri/src/lib.rs` の `invoke_handler` に `commands::agent::agent_duplicate` が登録されている
  - `grep -n 'agent_duplicate' src-tauri/src/lib.rs` でヒット
- `cargo build` が success (handler 登録の compile エラーが出ない)
- `cargo test --lib` が全 pass (Phase 1 + 2A 全テスト)
- `cargo clippy -- -D warnings` が warning 0 で通る
- 既存の Phase 1 commands (`agent_create` / `agent_list_by_project` / `agent_update`) の登録が消えていない
  - `grep -c '^\s*commands::agent::' src-tauri/src/lib.rs` の結果が 4 (create / list_by_project / update / duplicate)
