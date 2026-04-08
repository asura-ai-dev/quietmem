# Done When

## 検証コマンド

```bash
cd /Users/kzt/Desktop/project-d/product/quietmem/src-tauri
cargo test --lib db::migration
```

## チェック項目

- `001_init.sql` に `CREATE TABLE projects` が含まれる
- `001_init.sql` に `CREATE TABLE agents` が含まれる
- `001_init.sql` に `CREATE TABLE worktrees` が含まれる
- `001_init.sql` に `CREATE TABLE runs` が含まれる
- `001_init.sql` に `CREATE TABLE raw_memory_entries` が含まれる
- `001_init.sql` に `CREATE TABLE curated_memories` が含まれる
- `projects.slug` に UNIQUE 制約がある
- `agents` は `FOREIGN KEY (project_id) REFERENCES projects(id)` を持つ
- `worktrees` は `FOREIGN KEY (project_id) REFERENCES projects(id)` を持つ
- `agents.active_worktree_id` には FK 制約が無い
- インデックス `idx_projects_slug`, `idx_agents_project`, `idx_worktrees_project`, `idx_worktrees_agent`, `idx_runs_project`, `idx_runs_agent`, `idx_raw_memory_project`, `idx_raw_memory_agent`, `idx_curated_project`, `idx_curated_agent` が定義されている
- マイグレーションテストを更新し、`run_pending` 後に 6 テーブルすべてが `sqlite_master` に存在することを検証する
- `cargo test --lib db::migration` が成功する
