# task-2A06 done_when

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo build
cargo test --lib
cargo clippy --all-targets -- -D warnings
```

## チェック項目

- `cargo build` が exit 0 で成功
- `cargo test --lib` が exit 0 で全 pass
- `cargo test --lib` の総テスト数が Phase 1 完了時点 (39 tests) より 12 以上多い (status 検証 + duplicate + DTO deserialize の合計)
- `cargo clippy --all-targets -- -D warnings` が exit 0 で warning 0
- `src-tauri/src/lib.rs` の invoke_handler に `commands::agent::agent_duplicate` が含まれている
- `src-tauri/src/db/repo/agent.rs` の `duplicate` 関数が存在する
- `src-tauri/src/domain/agent.rs` に `AgentDuplicateInput` 構造体が存在する
- `src-tauri/src/domain/agent.rs` に `validate_agent_status` 関数が存在する
- Phase 1 の既存テストが 1 件も regression していない (`cargo test --lib` の出力に "FAILED" が含まれない)
