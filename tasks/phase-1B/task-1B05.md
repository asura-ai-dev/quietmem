# Task 1B05: agent リポジトリ (CRUD)

## Objective

`agents` テーブルに対する create / list_by_project / update を実装し、`active_worktree_id` を含む更新に対応する。ユニットテストで検証する。

## Scope

- `src-tauri/src/domain/agent.rs`
  - `Agent`, `AgentCreateInput`, `AgentUpdateInput` を定義 (`agent-docs/tauri-commands.md` に準拠)
  - `#[serde(rename_all = "camelCase")]`
- `src-tauri/src/domain/mod.rs` : `pub mod agent;` を追加
- `src-tauri/src/db/repo/agent.rs`
  - `pub fn create(conn: &Connection, input: AgentCreateInput) -> AppResult<Agent>`
    - project_id の存在チェック → 存在しなければ `NotFound`
    - id 生成 (uuid v7)
    - INSERT
    - 生成した Agent を返す
    - name が空なら `InvalidInput`
    - status / adapter_type / role は未指定時のデフォルトを適用
  - `pub fn list_by_project(conn: &Connection, project_id: &str) -> AppResult<Vec<Agent>>`
    - `WHERE project_id = ? ORDER BY updated_at DESC`
    - 存在しない project_id でも空 Vec を返す (エラーにしない)
  - `pub fn update(conn: &Connection, input: AgentUpdateInput) -> AppResult<Agent>`
    - 既存行 SELECT → 無ければ `NotFound`
    - 指定フィールドのみ更新 (None 保持)
    - `active_worktree_id` は `Option<Option<String>>` ではなく `Option<Option<String>>` の代替として `Option<String>` でよい (unset 機能を Phase 1 で要件化しない)
    - updated_at 更新
    - 更新後の Agent を返す
- `src-tauri/src/db/repo/mod.rs` : `pub mod agent;` を追加

## Implementation Notes

- 参照: `agent-docs/db-schema.md`, `agent-docs/tauri-commands.md`
- プロジェクト存在チェックは `SELECT 1 FROM projects WHERE id = ? LIMIT 1`
- `prompt_path` / `config_path` / `active_worktree_id` は nullable
- テスト:
  - 1B04 と同じヘルパ (`setup_db`) を使う
  - 事前に project を 1 件作ってから agent を作成
  - create → list_by_project で 1 件返る
  - 存在しない project_id で create すると `NotFound`
  - 存在しない project_id で list_by_project すると空 Vec
  - update で name / role を変更できる
  - update で `active_worktree_id` に値を設定できる
  - 存在しない id で update すると `NotFound`
- `Option` フィールドの扱い: serde の `#[serde(default, skip_serializing_if = "Option::is_none")]` を検討

## Depends On

- task-1B04
