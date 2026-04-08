# Task 1C02: Tauri commands - project

## Objective

Project の CRUD を Tauri commands として公開する。

## Scope

- `src-tauri/src/commands/project.rs`
  - `#[tauri::command] pub fn project_create(state: State<'_, AppState>, input: ProjectCreateInput) -> AppResult<Project>`
  - `#[tauri::command] pub fn project_list(state: State<'_, AppState>) -> AppResult<Vec<Project>>`
  - `#[tauri::command] pub fn project_update(state: State<'_, AppState>, input: ProjectUpdateInput) -> AppResult<Project>`
  - 各関数は `state.with_conn(|conn| db::repo::project::xxx(conn, input))` の形
- DTO は `src-tauri/src/domain/project.rs` のものを use

## Implementation Notes

- 参照: `agent-docs/tauri-commands.md` (命名規則とパターン)
- Tauri v2 の command 引数名は camelCase の JSON キーと一致する必要があるため、`input` / `state` のような引数名を用いる
- エラー時は `AppError` が自動で `Err` 側に serialize される
- この時点では Builder 登録はまだ不要 (1C05 で一括登録)

## Depends On

- task-1C01
