# Task 1A04: AppState 骨格 + AppPaths + ensure_base

## Objective

Rust 側に共有状態 `AppState` とローカルファイル保存先 `AppPaths` を追加し、アプリ起動時に必要なベースディレクトリが作成される仕組みを整える。

## Scope

- `src-tauri/Cargo.toml` : `directories = "5"`, `chrono = { version = "0.4", features = ["serde"] }`, `uuid = { version = "1", features = ["v7", "serde"] }` を dependencies に追加
- `src-tauri/src/error.rs`
  - `AppError` enum (NotFound / InvalidInput / Io / Internal の 4 種類をまず定義。Db バリアントは Phase 1B で追加)
  - `AppResult<T>` 型エイリアス
  - `serde::Serialize` 実装
- `src-tauri/src/paths.rs`
  - `AppPaths` 構造体と `resolve()` / `ensure_base()` / `db_dir()` / `db_file()` / `projects_root()` / `project_dir()` / `agent_dir()` / `agent_prompt_dir()` / `agent_config_dir()` / `agent_raw_dir()` / `run_log_dir()` / `snapshots_dir()` を実装
- `src-tauri/src/app_state.rs`
  - `pub struct AppState { pub paths: AppPaths }` (Phase 1B で `conn: Mutex<Connection>` を追加予定)
- `src-tauri/src/lib.rs`
  - モジュール宣言 (`mod error; mod paths; mod app_state;`)
  - `run()` 内で `AppPaths::resolve()` → `ensure_base()` を実行
  - `tauri::Builder::default().setup(|app| { ... }).manage(state)` で `AppState` を登録
  - 失敗時は `eprintln!` でログ出力

## Implementation Notes

- 参照: `agent-docs/file-storage.md`, `agent-docs/architecture.md`, `agent-docs/tauri-commands.md` (エラー型)
- `directories` crate の `ProjectDirs::from("dev", "quietmem", "QuietMem")` を使う
- `AppError::Internal` は `String` を保持するシンプルな variant
- `AppPaths` の各メソッドは `PathBuf` を返す。`create_dir_all` の呼び出しは `ensure_base()` のみで OK (他は呼び出し側が必要時に作成)
- Phase 1B で `AppError::Db(rusqlite::Error)` バリアントを追加するが、このチケットではまだ追加しない
- `AppState` は Phase 1B で拡張するため、今は `paths` のみで良い

## Depends On

- task-1A01
