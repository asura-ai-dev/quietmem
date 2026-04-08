# Task 1B07: 起動時 DB 初期化と AppState 統合

## Objective

アプリ起動時に SQLite ファイルを初期化し、マイグレーションを実行し、`AppState` に共有 Connection を保持するようにする。6 テーブルが存在することを smoke テストで確認する。

## Scope

- `src-tauri/src/app_state.rs`
  - `pub struct AppState { pub paths: AppPaths, pub conn: std::sync::Mutex<rusqlite::Connection> }`
  - `pub fn initialize() -> AppResult<AppState>`
    - `AppPaths::resolve()` → `ensure_base()`
    - `db::connection::open(&paths.db_file())`
    - `db::migration::run_pending(&mut conn)`
    - `Ok(AppState { paths, conn: Mutex::new(conn) })`
- `src-tauri/src/lib.rs`
  - `run()` 内で `AppState::initialize()` を呼び、失敗時は `eprintln!` + `return`
  - `tauri::Builder::default().manage(state).run(tauri::generate_context!())...`
- smoke テストモジュール (例: `src-tauri/src/db/tests.rs` または既存 migration テストに追加)
  - `open_in_memory` → `run_pending` の後、`sqlite_master` から 6 テーブルすべてが取れること

## Implementation Notes

- 参照: `agent-docs/architecture.md` (起動シーケンス), `agent-docs/db-schema.md`
- `Mutex<Connection>` で十分 (Phase 1 は単一スレッド前提の取得で OK)
- `initialize()` で返した `AppState` は `tauri::Builder::manage` に渡す
- smoke テストは `cargo test --lib` でまとめて実行できる場所に置く
- `run_pending` が `&mut Connection` を要求するため `initialize()` 内では `let mut conn = ...;` で所有権を持つ
- 起動ログ: `println!("quietmem: initialized db at {:?}", paths.db_file());` 相当を入れて手動確認を容易にする

## Depends On

- task-1B06
