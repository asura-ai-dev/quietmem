# task-2A04 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib db::repo::agent
cargo build
cargo clippy -- -D warnings
```

## チェック項目

- `src-tauri/src/db/repo/agent.rs` に `pub fn duplicate(conn: &Connection, input: AgentDuplicateInput) -> AppResult<Agent>` が存在する
  - `grep -n 'pub fn duplicate' src-tauri/src/db/repo/agent.rs` でヒット
- `duplicate` 関数内で `find_by_id` が呼ばれている
- `duplicate` 関数内で `validate_agent_status` が呼ばれている
- `duplicate` 関数内で `INSERT INTO agents` が実行される (`grep -n 'INSERT INTO agents' src-tauri/src/db/repo/agent.rs` で create と duplicate 2 箇所以上)
- `duplicate` 関数内で `raw_memory_entries` および `curated_memories` への INSERT/UPDATE/DELETE が **存在しない**
  - `grep -n 'raw_memory_entries\|curated_memories' src-tauri/src/db/repo/agent.rs` がプロダクションコードでヒットしない (テストの SELECT COUNT は OK)
- 単体テスト `duplicate_returns_new_agent_with_copied_fields` が pass する
- 単体テスト `duplicate_default_name_appends_copy_suffix` が pass する
  - 元 name `"planner"` → 新 name `"planner (copy)"`
- 単体テスト `duplicate_with_custom_name_uses_input` が pass する
- 単体テスト `duplicate_with_empty_custom_name_returns_invalid_input` が pass する
- 単体テスト `duplicate_with_missing_source_returns_not_found` が pass する
- 単体テスト `duplicate_does_not_touch_memory_tables` が pass する
  - `raw_memory_entries` と `curated_memories` の COUNT が duplicate 前後で変化しない
- 単体テスト `duplicate_starts_with_idle_status_even_if_source_was_running` が pass する
- 単体テスト `duplicate_starts_with_null_active_worktree_even_if_source_had_one` が pass する
- Phase 1 既存の `agent::tests::*` テストが全て引き続き pass する
- `cargo build` が success
- `cargo clippy -- -D warnings` が warning 0 で通る
- `cargo test --lib db::repo::agent` の総 pass 数が task-2A02 の状態より 8 以上増えている
