# L09 Data Storage

## Objective

QuietMem の保存戦略を定義し、SQLite とローカルファイルの責務分担、および MVP テーブル設計の基礎を明確にする。

## Scope

- 保存方式
- SQLite 対象
- ローカルファイル対象
- テーブル設計ドラフト

## Requirements

### 1. Storage Policy

- 検索 / 一覧 / 関連付けは SQLite に保存する
- 重い本文はローカルファイルに保存する

### 2. SQLite Storage Targets

- projects
- agents
- runs
- cron_jobs
- curated_memories
- raw_memory_index または raw_memory_entries 相当
- worktrees

### 3. Local File Storage Targets

- raw memory 本文
- 実行ログ全文
- prompt ファイル
- agent 設定 JSON
- スナップショット

### 4. Draft Tables

- projects は name、slug、root_path を持つ
- agents は project_id、name、role、adapter_type、prompt_path、config_path、status を持つ
- worktrees は project_id、agent_id、branch_name、path、base_branch、status を持つ
- runs は project_id、agent_id、worktree_id、cron_job_id、task_title、task_input、status、log_path を持つ
- cron_jobs は project_id、agent_id、schedule_expr、timezone、enabled、task_template、memory_scope を持つ
- curated_memories は title、summary、category、scope、importance、source_refs_json を持つ
- raw_memory_entries は type、content_path、summary、tags_json を持つ
- file_artifacts は project_id、agent_id、run_id、worktree_id、kind、path、metadata_json を持つ

## Acceptance Criteria

- 大きな本文データを DB に無理に格納しない構造になっている
- 一覧表示や検索に必要なメタデータは SQLite から高速に引ける
- memory / run / file artifact の相互参照が成立する

## Non-Goals

- 分散 DB 対応
- クラウド同期
- 複雑なマルチユーザー整合性制御
