# task-2A02 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib db::repo::agent
cargo build
cargo clippy -- -D warnings
```

## チェック項目

- `src-tauri/src/db/repo/agent.rs` の `create` 関数内で `validate_agent_status` が呼ばれている
  - `grep -n 'validate_agent_status' src-tauri/src/db/repo/agent.rs` で 2 箇所以上ヒット (create と update)
- `src-tauri/src/db/repo/agent.rs` の `update` 関数内で `validate_agent_status` が呼ばれている
- 単体テスト `create_with_invalid_status_returns_invalid_input` が pass する
- 単体テスト `create_accepts_all_four_status_values` が pass する
  - 4 値 (`idle`, `running`, `error`, `needs_input`) すべてが Ok を返す
- 単体テスト `update_with_invalid_status_returns_invalid_input` が pass する
- 単体テスト `update_accepts_needs_input_status` が pass する
- Phase 1 既存の `update_with_none_fields_preserves_existing_values` (status `running` を投入) が引き続き pass する
- Phase 1 既存の `create_then_list_by_project_returns_one_agent` / `create_applies_default_values` 等が引き続き pass する
- `cargo build` が success
- `cargo clippy -- -D warnings` が warning 0 で通る
- `cargo test --lib db::repo::agent` の総 pass 数が Phase 1 のテスト数 + 4 以上になっている
