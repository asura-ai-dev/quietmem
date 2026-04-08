# Task 1B04: project リポジトリ (CRUD)

## Objective

`projects` テーブルに対する create / list / update を行う repo 層を実装し、ユニットテストで検証する。

## Scope

- `src-tauri/src/db/mod.rs` : `pub mod repo;` を追加
- `src-tauri/src/db/repo/mod.rs` : `pub mod project;`
- `src-tauri/src/db/repo/project.rs`
  - DTO 定義 (`Project`, `ProjectCreateInput`, `ProjectUpdateInput`) または `commands/project.rs` との共有方針を選ぶ
    - **推奨**: DTO は `commands/project.rs` 側に置き、repo 関数はそちらの型を引数・戻り値に使う
    - Phase 1B の段階では `commands` モジュールはまだ無いので、repo 用に暫定的に `src-tauri/src/domain/project.rs` を作成し、Phase 1C で commands が domain を参照する形にする
  - 採用案: `src-tauri/src/domain/mod.rs` + `src-tauri/src/domain/project.rs` で DTO 定義
    - `Project`, `ProjectCreateInput`, `ProjectUpdateInput` を公開
    - `#[serde(rename_all = "camelCase")]`
  - 関数:
    - `pub fn create(conn: &Connection, input: ProjectCreateInput) -> AppResult<Project>`
      - id を uuid v7 で生成
      - created_at / updated_at に現在時刻 (ISO8601 UTC)
      - INSERT 実行
      - 生成された Project を返す
      - slug が空 / 不正形式なら `InvalidInput`
      - UNIQUE 違反 (slug) は `InvalidInput` にマップ
    - `pub fn list(conn: &Connection) -> AppResult<Vec<Project>>`
      - `ORDER BY updated_at DESC`
    - `pub fn update(conn: &Connection, input: ProjectUpdateInput) -> AppResult<Project>`
      - 既存行を SELECT
      - 存在しなければ `NotFound`
      - 指定フィールドのみ更新 (None は保持)
      - updated_at を現在時刻に更新
      - 更新後の Project を返す
- `src-tauri/src/lib.rs` : `pub mod domain;`

## Implementation Notes

- 参照: `agent-docs/db-schema.md`, `agent-docs/tauri-commands.md`
- `slug` バリデーション: 正規表現の代わりに `chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_')` で十分
- UNIQUE 違反は `rusqlite::Error::SqliteFailure` の `code == ErrorCode::ConstraintViolation` で検出
- ユニットテスト (同ファイル `#[cfg(test)]`):
  - create → list で 1 件返ること
  - create → update (name 変更) → list で name 変更が反映されていること
  - 重複 slug で create すると `InvalidInput`
  - 存在しない id で update すると `NotFound`
  - update で None のフィールドは変化しないこと
- テストのセットアップは `db::connection::open_in_memory()` + `db::migration::run_pending()` を使うヘルパを作る (例: `fn setup_db() -> Connection`)

## Depends On

- task-1B03
