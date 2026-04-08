-- Phase 1 初期スキーマ
--
-- 参照: agent-docs/db-schema.md
-- 対象テーブル:
--   projects / agents / worktrees (Phase 1 CRUD 対象)
--   runs / raw_memory_entries / curated_memories (骨格のみ)
--
-- 規約:
-- * id は TEXT PRIMARY KEY (Rust 側で uuid v7 を生成)
-- * created_at / updated_at は ISO8601 UTC 文字列
-- * projects を参照する agents / worktrees のみ FK を張る
-- * agents.active_worktree_id と worktrees.agent_id は循環回避のため FK を張らない
-- * runs / raw_memory_entries / curated_memories は後続フェーズで決定するため FK を張らない

-- projects ----------------------------------------------------------------
CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  root_path   TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX idx_projects_slug ON projects(slug);

-- agents ------------------------------------------------------------------
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

-- worktrees ---------------------------------------------------------------
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

-- runs (骨格のみ) ---------------------------------------------------------
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

-- raw_memory_entries (骨格のみ) -------------------------------------------
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

-- curated_memories (骨格のみ) ---------------------------------------------
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
