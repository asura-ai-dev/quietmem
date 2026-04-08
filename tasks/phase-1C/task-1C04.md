# Task 1C04: Tauri commands - worktree

## Objective

Worktree の CRUD を Tauri commands として公開する。

## Scope

- `src-tauri/src/commands/worktree.rs`
  - `#[tauri::command] pub fn worktree_create(state, input: WorktreeCreateInput) -> AppResult<Worktree>`
  - `#[tauri::command] pub fn worktree_list_by_project(state, project_id: String) -> AppResult<Vec<Worktree>>`
  - `#[tauri::command] pub fn worktree_update(state, input: WorktreeUpdateInput) -> AppResult<Worktree>`
- DTO は `domain::worktree::*`

## Implementation Notes

- 参照: `agent-docs/tauri-commands.md`
- 1C03 と同じパターン
- Rust 側関数名と Tauri コマンド名は一致させる

## Depends On

- task-1C03
