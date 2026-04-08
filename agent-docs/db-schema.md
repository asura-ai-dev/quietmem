# DB スキーマ

## 概要

SQLite に格納する 6 テーブルの最小カラム、制約、インデックス、マイグレーション戦略を定義する。Phase 1 では `projects` / `agents` / `worktrees` を CRUD 対象とし、`runs` / `raw_memory_entries` / `curated_memories` は後続フェーズ向けに骨格のみ作成する。

## 仕様からの対応

- spec.md §4.1 SQLite 初期化とスキーマ
- spec.md §4.1.1 テーブル定義
- spec.md §5.1 受け入れ条件 (DB 部)
- L09-data-storage.md §2 / §4

## 採用ライブラリ

- `rusqlite` (bundled feature, SQLite を同梱)
- マイグレーションは自前実装の軽量 runner (理由は `tech-stack.md` 参照)

## 共通規約

- すべての `id` カラムは `TEXT PRIMARY KEY` とし、値は Rust 側で `uuid` crate の v7 を使って生成する
- すべてのテーブルに `created_at TEXT NOT NULL`, `updated_at TEXT NOT NULL` を持たせる (ISO8601 UTC)
- 時刻は Rust 側で `chrono::Utc::now().to_rfc3339()` で生成
- `slug` / `name` など NOT NULL の自由文字列はアプリケーション側でトリム後の長さ 1 以上を保証
- 外部キー制約は有効化する (`PRAGMA foreign_keys = ON`)
- `agents.active_worktree_id` と `worktrees.agent_id` は論理参照。循環 FK を避けるため SQL 制約は付けない (アプリ側で整合性を守る)

## テーブル定義

### projects

```sql
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  root_path   TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX idx_projects_slug ON projects(slug);
```

### agents

```sql
CREATE TABLE agents (
  id                  TEXT PRIMARY KEY,
  project_id          TEXT NOT NULL,
  name                TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT '',
  adapter_type        TEXT NOT NULL DEFAULT 'cli',
  prompt_path         TEXT,
  config_path         TEXT,
  status              TEXT NOT NULL DEFAULT 'idle',
  active_worktree_id  TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_agents_project ON agents(project_id);
```

- `active_worktree_id` に FK を張らない (循環回避)
- `status` は `'idle' | 'running' | 'error'` を想定するが Phase 1 では文字列として緩く扱う

### worktrees

```sql
CREATE TABLE worktrees (
  id           TEXT PRIMARY KEY,
  project_id   TEXT NOT NULL,
  agent_id     TEXT,
  branch_name  TEXT NOT NULL,
  path         TEXT NOT NULL,
  base_branch  TEXT NOT NULL DEFAULT 'main',
  status       TEXT NOT NULL DEFAULT 'ready',
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_worktrees_project ON worktrees(project_id);
CREATE INDEX idx_worktrees_agent ON worktrees(agent_id);
```

- `agent_id` は nullable。循環回避のため FK を張らない。

### runs (骨格のみ)

```sql
CREATE TABLE runs (
  id                    TEXT PRIMARY KEY,
  project_id            TEXT NOT NULL,
  agent_id              TEXT NOT NULL,
  worktree_id           TEXT,
  cron_job_id           TEXT,
  task_title            TEXT NOT NULL,
  task_input            TEXT NOT NULL DEFAULT '',
  status                TEXT NOT NULL DEFAULT 'pending',
  log_path              TEXT,
  interaction_log_path  TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);

CREATE INDEX idx_runs_project ON runs(project_id);
CREATE INDEX idx_runs_agent ON runs(agent_id);
```

- Phase 1 では INSERT/SELECT/UPDATE を行わない
- FK は付けない (後続フェーズで整合性要件が固まってから追加)

### raw_memory_entries (骨格のみ)

```sql
CREATE TABLE raw_memory_entries (
  id                            TEXT PRIMARY KEY,
  project_id                    TEXT NOT NULL,
  agent_id                      TEXT,
  type                          TEXT NOT NULL,
  content_path                  TEXT NOT NULL,
  summary                       TEXT NOT NULL DEFAULT '',
  tags_json                     TEXT NOT NULL DEFAULT '[]',
  source_raw_memory_entry_id    TEXT,
  embedding_status              TEXT NOT NULL DEFAULT 'pending',
  created_at                    TEXT NOT NULL,
  updated_at                    TEXT NOT NULL,
  dismissed_at                  TEXT
);

CREATE INDEX idx_raw_memory_project ON raw_memory_entries(project_id);
CREATE INDEX idx_raw_memory_agent ON raw_memory_entries(agent_id);
```

### curated_memories (骨格のみ)

```sql
CREATE TABLE curated_memories (
  id                  TEXT PRIMARY KEY,
  project_id          TEXT NOT NULL,
  agent_id            TEXT,
  title               TEXT NOT NULL,
  summary             TEXT NOT NULL DEFAULT '',
  category            TEXT NOT NULL DEFAULT '',
  curation_type       TEXT NOT NULL DEFAULT 'note',
  scope               TEXT NOT NULL DEFAULT 'agent',
  importance          INTEGER NOT NULL DEFAULT 0,
  source_refs_json    TEXT NOT NULL DEFAULT '[]',
  timeframe_type      TEXT NOT NULL DEFAULT 'none',
  timeframe_start     TEXT,
  timeframe_end       TEXT,
  key_points_json     TEXT NOT NULL DEFAULT '[]',
  embedding_status    TEXT NOT NULL DEFAULT 'pending',
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE INDEX idx_curated_project ON curated_memories(project_id);
CREATE INDEX idx_curated_agent ON curated_memories(agent_id);
```

## マイグレーション戦略

- 物理ファイル: `src-tauri/src/db/migrations/NNN_name.sql` (連番 3 桁 + snake_case)
- メタテーブル `schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)` を最初に作成
- 起動時に `run_pending(conn)` が以下を実行
  1. `schema_migrations` が無ければ作成
  2. ディレクトリの SQL ファイルを連番順に列挙
  3. `schema_migrations` に存在しないバージョンを 1 トランザクションずつ適用
  4. 各適用後に `INSERT INTO schema_migrations`
- Phase 1 で用意するファイル
  - `001_init.sql` : 全テーブル作成 (上記 6 テーブル + `schema_migrations` 以外)
- マイグレーションファイルは Rust バイナリに `include_str!` で埋め込む (配布時のファイル欠落対策)

## テスト方針

- `db::repo::*` の全関数を `:memory:` DB で単体テスト
- テスト時も本番と同じマイグレーション runner を通す
- テストケース最低ライン
  - projects: create → list → update → list (更新反映)
  - agents: create → list_by_project → update (active_worktree_id)
  - worktrees: create → list_by_project → update
  - runs / raw_memory_entries / curated_memories: テーブルが存在することの確認 (`SELECT 1 FROM ... LIMIT 0`)

## 制約・注意事項

- `PRAGMA foreign_keys = ON` を接続確立ごとに実行する
- `PRAGMA journal_mode = WAL` を初回接続時に実行する
- テストの `:memory:` は接続を閉じると消えるため、1 テスト 1 接続を徹底する
- SQL 文字列は `include_str!` または raw string で書き、文字列連結によるインジェクションを避ける
- ユーザー入力は必ずバインドパラメータ経由で渡す
