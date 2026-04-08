# Task 1B01: rusqlite 導入と DB 接続モジュール

## Objective

`rusqlite` を依存に追加し、SQLite 接続を張る基盤 (`db::connection`) を実装する。WAL モードと外部キー制約を有効化する。

## Scope

- `src-tauri/Cargo.toml`
  - dependencies に `rusqlite = { version = "0.31", features = ["bundled"] }` を追加
- `src-tauri/src/error.rs`
  - `AppError` に `Db(#[from] rusqlite::Error)` バリアントを追加
  - `Serialize` 実装の `match` に `Db` を追加 (code: `db_error`)
- `src-tauri/src/db/mod.rs`
  - `pub mod connection;` と後続で追加する `pub mod migration;` のコメントアウト雛形
- `src-tauri/src/db/connection.rs`
  - `pub fn open(db_file: &Path) -> AppResult<Connection>`
    - 親ディレクトリを `create_dir_all`
    - `Connection::open(db_file)`
    - `PRAGMA journal_mode = WAL;`
    - `PRAGMA foreign_keys = ON;`
    - 接続を返す
  - `pub fn open_in_memory() -> AppResult<Connection>` (テスト用)
    - `Connection::open_in_memory()`
    - `PRAGMA foreign_keys = ON;`
- `src-tauri/src/lib.rs`
  - `pub mod db;` を追加

## Implementation Notes

- 参照: `agent-docs/db-schema.md`, `agent-docs/tech-stack.md`
- `rusqlite` は `bundled` feature で SQLite を同梱 (環境依存を回避)
- PRAGMA は `conn.pragma_update` または `conn.execute_batch` で実行
- `connection.rs` にユニットテストを書く:
  - `open_in_memory` が成功すること
  - `PRAGMA foreign_keys` が 1 を返すこと
- テストは `#[cfg(test)]` モジュールに配置

## Depends On

- task-1A04
