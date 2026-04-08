# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo check
cargo test --lib db::connection
```

## チェック項目

- `Cargo.toml` の dependencies に `rusqlite = { version = "0.31", features = ["bundled"] }` がある
- `src-tauri/src/db/mod.rs` が存在し `pub mod connection;` を公開
- `src-tauri/src/db/connection.rs` が存在し `open` と `open_in_memory` 関数を持つ
- `open` / `open_in_memory` は `PRAGMA foreign_keys = ON` を設定する
- `open` は `PRAGMA journal_mode = WAL` を設定する
- `AppError` に `Db(rusqlite::Error)` バリアントがあり、`Serialize` で code `db_error` にマップされる
- `cargo check` がエラーなし
- `db::connection` 配下のテストが最低 1 件存在し、`cargo test --lib db::connection` が成功する
