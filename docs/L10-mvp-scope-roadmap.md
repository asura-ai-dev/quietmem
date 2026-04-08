# L10 MVP Scope / Roadmap

## Objective

MVP の対象機能、除外範囲、実装順を定義し、段階的な実装計画として整理する。

## Scope

- MVP 目的
- 必須機能
- 除外機能
- 実装順

## Requirements

### 1. MVP Goals

- 複数 agent の並列開発をしやすくする
- agent ごとの memory を可視化 / 編集できるようにする
- コード / 文書 / prompt を 1 つの GUI で扱えるようにする
- cron job による定期実行を導入する
- worktree / branch / diff / run 状態を見やすくする

### 2. MVP Required Functional Areas

- Agent 管理
- Memory 管理
- Editor / Workspace
- 実行管理
- Git / Worktree
- Cron Job

### 3. Out of Scope for MVP

- memory graph
- 高度な自動分類
- 複雑な handoff / fork 制御
- 大量の外部 SaaS 連携
- 高度な自律判断
- PR 作成の高度自動化

### 4. Implementation Order

1. Phase 1: Tauri + React セットアップ、SQLite 接続、レイアウト骨組み、projects / agents / worktrees 最低限 CRUD
2. Phase 2: agent 一覧表示、agent 作成 / 編集 / 複製、project 切替、worktree 一覧表示
3. Phase 3: Monaco 統合、ファイルツリー表示、ファイル読み書き、タブ表示
4. Phase 4: curated memory CRUD、raw memory index 表示、raw memory 検索、raw → curated 昇格 UI
5. Phase 5: adapter interface、Claude Code adapter、run 開始 / 停止 / 再試行、log 表示、run 履歴表示
6. Phase 6: worktree 作成、branch 表示、changed files 表示、diff 表示
7. Phase 7: cron job CRUD、ON / OFF 切替、手動実行、run 紐付け、履歴表示
8. Phase 8: status 表示改善、エラーハンドリング、memory 候補表示、全体 UX 調整

## Acceptance Criteria

- MVP 範囲と非範囲が明確に分かれている
- 実装順が依存関係に沿っている
- この文書だけで初期開発バックログを起こせる

## Non-Goals

- リリース後運用計画の詳細化
- MVP を超える将来構想の詳細設計
