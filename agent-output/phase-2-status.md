# Phase 2: Architecture

- 目的: spec.md を詳細設計ドキュメントとフェーズ分けタスクチケットに分解する
- 開始日: 2026-04-08
- 更新日: 2026-04-08

## Spec Alignment

- spec.md (QTM-001 + QTM-002) を 6 サブフェーズ (1A〜1F) に分解。Tauri 基盤 → SQLite → commands → frontend 基盤 → Workspace Shell → 統合 UI の順。

## Phase

Complete (pass)

## Completed

- architect agent (a47bd9c05b2d2c4a4) で設計ドキュメント 6 本 + フェーズ計画 + チケット 32 ペアを生成
- 設計ドキュメント (agent-docs/):
  - architecture.md
  - db-schema.md
  - tauri-commands.md
  - ui-shell.md
  - file-storage.md
  - tech-stack.md
- フェーズ計画: tasks/phases.md
- チケット (32 ペア = task-_.md + task-_.done_when.md):
  - Phase 1A: 4 (1A01-1A04) プロジェクト基盤
  - Phase 1B: 7 (1B01-1B07) SQLite データ層
  - Phase 1C: 5 (1C01-1C05) Tauri commands
  - Phase 1D: 5 (1D01-1D05) フロントエンド基盤
  - Phase 1E: 5 (1E01-1E05) Workspace Shell
  - Phase 1F: 5 (1F01-1F05) Project/Agent/Worktree UI 統合
- done_when は全てチケット本体から分離 (1A01 で形式確認済み)
- 主要技術決定:
  - SQLite: rusqlite (bundled)
  - マイグレーション: 自前 runner + schema_migrations
  - 状態管理: zustand
  - スタイリング: CSS Modules + tokens.css
  - ルーティング: 自前 state-based (uiStore.route)
  - パッケージマネージャ: pnpm
  - ID 採番: UUID v7

## In Progress

- なし

## Not Started

- Phase 2.5: チケット登録 (TaskCreate で 32 チケット + 6 Evaluate タスク登録)
- Phase 3 以降: Implement / Evaluate

## Failed Tests / Known Issues

- なし

## Key Decisions

- フェーズ内チケットは前番号への直列依存 (シンプル化)
- Phase 1D の bindings.ts (1D01) は Phase 1C 完了後にのみ着手 (DTO 整合性のため)
- Smoke Flow 統合確認は task-1F05 で実施
- runs / raw_memory_entries / curated_memories はテーブル骨格のみ (CRUD なし)

## Next Step

- Phase 2.5: tasks/phases.md と全チケットファイルを読み、TaskCreate で 32 Implement タスク + 6 Evaluate タスクを登録
- 各チケットに metadata (ticket / phase / done_when_path) を付与
- depends_on を addBlockedBy に変換
- Phase 7 (Final) の blockedBy に全 Evaluate タスク ID を追加

## Files Changed

- agent-docs/architecture.md (新規)
- agent-docs/db-schema.md (新規)
- agent-docs/tauri-commands.md (新規)
- agent-docs/ui-shell.md (新規)
- agent-docs/file-storage.md (新規)
- agent-docs/tech-stack.md (新規)
- tasks/phases.md (新規)
- tasks/phase-1A/ ~ tasks/phase-1F/ 配下に 32 チケットペア (新規)
- agent-output/phase-2-status.md (新規)
