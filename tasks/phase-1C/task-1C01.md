# Task 1C01: commands モジュール基盤と AppError 整備

## Objective

`commands/` モジュールの雛形と、`AppError` の Tauri コマンド利用に必要な最終形を整える。

## Scope

- `src-tauri/src/commands/mod.rs`
  - `pub mod project;`
  - `pub mod agent;`
  - `pub mod worktree;`
  - (各モジュール本体は空 or 雛形、次チケットで埋める)
- `src-tauri/src/commands/project.rs` : 空 (placeholder comment のみ)
- `src-tauri/src/commands/agent.rs` : 空
- `src-tauri/src/commands/worktree.rs` : 空
- `src-tauri/src/error.rs` の確認・整理
  - 全バリアントが `Serialize` で `{ code, message }` を返すこと
  - `code` の一覧: `not_found`, `invalid_input`, `db_error`, `io_error`, `internal`
- `src-tauri/src/lib.rs`
  - `pub mod commands;` を追加
- `src-tauri/src/app_state.rs`
  - AppState に対する薄いヘルパ `pub fn with_conn<T>(&self, f: impl FnOnce(&Connection) -> AppResult<T>) -> AppResult<T>` を追加
    - `conn.lock().map_err(|_| AppError::Internal("lock".into()))?` → `f(&conn)`

## Implementation Notes

- 参照: `agent-docs/tauri-commands.md` (エラー型とパターン)
- `with_conn` ヘルパがあると各 command が 1 行で書ける
- Phase 1 では `&Connection` で十分 (UPDATE も `Connection` 経由で書ける)
- この段階では `tauri::Builder::invoke_handler` はまだ空でよい。1C05 で登録

## Depends On

- task-1B07
