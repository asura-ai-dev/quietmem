# Phase 1 (Planning) — QuietMem Phase 2 / QTM-003

- 目的: QTM-003 (Agent Management UI) の高レベル仕様を `agent-docs/spec.md` に書き出す
- 開始日: 2026-04-09
- 更新日: 2026-04-09

## Spec Alignment

- QTM-003 Agent Management UI のチケット要件 (一覧 / 作成 / 編集 / 複製 / status 表示 / project switcher / memory 非引継ぎ) を Phase 2 spec として体系化

## Phase

Complete (pass)

## Completed

- Phase 1 アーティファクトのアーカイブ (`agent-docs/spec.md` → `phase-1-spec.md`, `tasks/phases.md` → `phase-1-phases.md`)
- planner agent 起動 (`subagent_type: planner`, agentId `a9c8208adc8d70014`)
- `/Users/kzt/Desktop/project-d/product/quietmem/agent-docs/spec.md` (394 行) を新規作成
- spec の主要セクション (目的 / Scope / Non-goals / Key Features / 受け入れ条件 / Smoke Flow / Evaluator Checklist / 依存関係) を確認

## In Progress

- なし

## Not Started

- Phase 2 (Architecture): architect agent で spec を詳細設計 + チケットへ分解
- Phase 2.5: チケット登録 (`tasks/phase-2*/`) と Evaluate / Phase 7 の依存設定

## Failed Tests / Known Issues

- なし (Planning フェーズ)

## Key Decisions

- **Phase 1 アーカイブ方針**: 既存 `spec.md` / `phases.md` をそれぞれ `phase-1-spec.md` / `phase-1-phases.md` にリネーム。Phase 1 の architecture 系 docs (db-schema.md / tech-stack.md など) は実体を表すので残置
- **spec scope**: QTM-003 のチケット要件に集中。Run/Adapter (QTM-006), Memory CRUD (QTM-005), Worktree git (QTM-007), Agent 削除/アーカイブ は Non-goals に明示
- **status 4 値**: `idle | running | error | needs_input` を Rust 側でホワイトリスト検証する方針 (DB スキーマ変更なし、バックエンド緩い enum)
- **複製方針**: `agent_duplicate` Tauri command 新設。memory テーブルには touch しない (= 何もしないことが memory 非引継ぎ)
- **Phase 1 ギャップ吸収**: LeftSidebar Agents セクションの placeholder 撤去を本フェーズで実施

## Next Step

- Phase 2 (Architecture) を開始: architect agent に `agent-docs/spec.md` のパスを渡し、詳細設計ドキュメント + `tasks/phase-2*/task-2*.md` + 同 `task-2*.done_when.md` を生成させる

## Files Changed

- agent-docs/spec.md (新規, 394 行, planner 出力)
- agent-docs/phase-1-spec.md (旧 spec.md からリネーム)
- tasks/phase-1-phases.md (旧 tasks/phases.md からリネーム)
- agent-output/phase-2-planning-status.md (本ファイル)
