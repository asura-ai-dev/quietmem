# Task 1B03: 初期スキーマ (001_init.sql)

## Objective

Phase 1 で必要な 6 テーブル (`projects` / `agents` / `worktrees` / `runs` / `raw_memory_entries` / `curated_memories`) と関連インデックスを `001_init.sql` に定義する。

## Scope

- `src-tauri/src/db/migrations/001_init.sql`
  - `projects` テーブル作成 (id, name, slug UNIQUE, root_path, created_at, updated_at)
  - `agents` テーブル作成 (全カラム + FK project_id)
  - `worktrees` テーブル作成 (全カラム + FK project_id)
  - `runs` テーブル骨格作成
  - `raw_memory_entries` テーブル骨格作成
  - `curated_memories` テーブル骨格作成
  - 各 `CREATE INDEX`

## Implementation Notes

- 参照: `agent-docs/db-schema.md` (そのまま転写)
- 全テーブル `CREATE TABLE IF NOT EXISTS` ではなく素直に `CREATE TABLE` で良い (マイグレーション runner が冪等性を担保するため)
- ただしステートメント単位の区切りは `;` + 改行
- FK は `projects` を参照する `agents` / `worktrees` のみ張る
- `agents.active_worktree_id` と `worktrees.agent_id` は FK を張らない (循環回避)
- `runs` / `raw_memory_entries` / `curated_memories` は FK を張らない (後続フェーズで決定)
- インデックスもすべて追加 (`db-schema.md` の各節に記載)

## Depends On

- task-1B02
