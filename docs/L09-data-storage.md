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
- agents は project_id、name、role、adapter_type、prompt_path、config_path、status、active_worktree_id を持つ
- worktrees は project_id、agent_id、branch_name、path、base_branch、status を持つ
- runs は project_id、agent_id、worktree_id、cron_job_id、task_title、task_input、status、log_path、interaction_log_path を持つ
- cron_jobs は project_id、agent_id、schedule_expr、timezone、enabled、task_template、memory_scope を持つ
- curated_memories は project_id、agent_id、title、summary、category、curation_type、scope、importance、source_refs_json、timeframe_type、timeframe_start、timeframe_end、key_points_json、embedding_status、created_at、updated_at を持つ
- raw_memory_entries は project_id、agent_id、type、content_path、summary、tags_json、source_raw_memory_entry_id、embedding_status、created_at、updated_at、dismissed_at を持つ
- file_artifacts は project_id、agent_id、run_id、worktree_id、kind、path、metadata_json を持つ

### 5. Storage Notes

- run 単位の interaction log を正本として保存する
- agent 履歴ビューは run interaction log の集約として構築する
- promoted note と digest は常に元 raw memory または下位 digest への参照を保持する
- project raw memory に反映された agent 起点事象は元 agent raw memory を参照で辿れるようにする
- semantic search の対象は raw memory と curated memory の両方とする
- embedding は通常バックグラウンドで生成し、必要時のみ同期フォールバックを許可する
- project raw の自動反映に review required を求めるかどうかは `QUIETMEM_PROJECT_RAW_REVIEW_REQUIRED` で切り替えられる

## Acceptance Criteria

- 大きな本文データを DB に無理に格納しない構造になっている
- 一覧表示や検索に必要なメタデータは SQLite から高速に引ける
- memory / run / file artifact の相互参照が成立する
- project / agent の両 memory scope と digest 階層を表現できる

## Non-Goals

- 分散 DB 対応
- クラウド同期
- 複雑なマルチユーザー整合性制御
