# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo check
cargo test --lib
```

## チェック項目

- `src-tauri/src/commands/mod.rs` が存在し `project`, `agent`, `worktree` サブモジュールを宣言
- `src-tauri/src/commands/project.rs`, `agent.rs`, `worktree.rs` のファイルが存在 (空でも可)
- `src-tauri/src/lib.rs` に `pub mod commands;` がある
- `AppError` が 5 種類 (`NotFound`, `InvalidInput`, `Db`, `Io`, `Internal`) を持ち `Serialize` でそれぞれ `not_found`, `invalid_input`, `db_error`, `io_error`, `internal` にマップ
- `AppState::with_conn` が存在し、`Connection` をクロージャに渡せる
- `cargo check` がエラーなし
- `cargo test --lib` が全件成功
