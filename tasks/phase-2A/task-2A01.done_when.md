# task-2A01 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib domain::agent::tests::validate_agent_status
cargo test --lib domain::agent::tests::agent_status_values
cargo build
cargo clippy -- -D warnings
```

## チェック項目

- `src-tauri/src/domain/agent.rs` に `pub const AGENT_STATUS_VALUES: &[&str]` が存在する
- `AGENT_STATUS_VALUES` の要素数が 4 で、`["idle", "running", "error", "needs_input"]` を含む
  - `grep -n 'AGENT_STATUS_VALUES' src-tauri/src/domain/agent.rs` でヒット
- `pub fn validate_agent_status(status: &str) -> AppResult<()>` が存在する
  - `grep -n 'fn validate_agent_status' src-tauri/src/domain/agent.rs` でヒット
- 単体テスト `validate_agent_status_accepts_all_four_values` が pass する
- 単体テスト `validate_agent_status_rejects_unknown_value` が pass する
- 単体テスト `validate_agent_status_rejects_empty_string` が pass する
- 単体テスト `validate_agent_status_is_case_sensitive` が pass する
- 単体テスト `agent_status_values_contains_exactly_four_values` (またはそれに相当する名前) が pass する
- `cargo build` が success
- `cargo clippy -- -D warnings` が warning 0 で通る
- Phase 1 既存テスト (`agent::tests::*`) が引き続き全て pass する (`cargo test --lib db::repo::agent` の数が Phase 1 から減っていない)
