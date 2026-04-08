# Task 1B06: worktree リポジトリ (CRUD)

## Objective

`worktrees` テーブルに対する create / list_by_project / update を実装し、ユニットテストで検証する。

## Scope

- `src-tauri/src/domain/worktree.rs`
  - `Worktree`, `WorktreeCreateInput`, `WorktreeUpdateInput` を定義 (`agent-docs/tauri-commands.md` に準拠)
- `src-tauri/src/domain/mod.rs` : `pub mod worktree;` を追加
- `src-tauri/src/db/repo/worktree.rs`
  - `pub fn create(conn: &Connection, input: WorktreeCreateInput) -> AppResult<Worktree>`
    - project_id 存在チェック → 無ければ `NotFound`
    - branch_name / path が空なら `InvalidInput`
    - base_branch のデフォルトは `"main"`
    - status のデフォルトは `"ready"`
    - id 生成 + INSERT + Worktree 返却
  - `pub fn list_by_project(conn: &Connection, project_id: &str) -> AppResult<Vec<Worktree>>`
    - `WHERE project_id = ? ORDER BY updated_at DESC`
    - 存在しない project_id は空 Vec
  - `pub fn update(conn: &Connection, input: WorktreeUpdateInput) -> AppResult<Worktree>`
    - 存在しない id は `NotFound`
    - 指定フィールドのみ更新
- `src-tauri/src/db/repo/mod.rs` : `pub mod worktree;` を追加

## Implementation Notes

- 参照: `agent-docs/db-schema.md`, `agent-docs/tauri-commands.md`
- `agent_id` は nullable
- テスト:
  - 事前に project を作成
  - create → list_by_project で 1 件
  - 存在しない project で create → `NotFound`
  - update で branch_name / status を変更
  - 存在しない id の update → `NotFound`
  - 空 branch_name で create → `InvalidInput`
- 1B04 / 1B05 と同じ `setup_db` ヘルパを使用

## Depends On

- task-1B05
