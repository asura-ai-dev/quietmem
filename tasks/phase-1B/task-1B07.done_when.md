# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo build
cargo test --lib
```

## チェック項目

- `AppState` が `paths: AppPaths` と `conn: Mutex<Connection>` を持つ
- `AppState::initialize()` が `AppPaths::resolve` → `ensure_base` → `db::connection::open` → `db::migration::run_pending` を順に呼ぶ
- `lib.rs` の `run()` が `AppState::initialize()` を呼び、失敗時は stderr にログを出す
- `tauri::Builder::default().manage(state)` で AppState が登録される
- `run_pending` 後に `projects`, `agents`, `worktrees`, `runs`, `raw_memory_entries`, `curated_memories` の 6 テーブルが `sqlite_master` に存在する smoke テストが存在する
- `cargo build` がエラーなし
- `cargo test --lib` が全件成功する
