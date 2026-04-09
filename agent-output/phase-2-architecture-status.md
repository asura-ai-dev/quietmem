# Phase 2 (Architecture) — QuietMem Phase 2 / QTM-003

- 目的: spec.md を詳細設計と Implement チケットへ分解する
- 開始日: 2026-04-09
- 更新日: 2026-04-09

## Spec Alignment

- `agent-docs/spec.md` (QTM-003 Agent Management UI) を 4 サブフェーズ × 22 Implement チケットへ分解

## Phase

Complete (pass)

## Completed

- architect agent 起動 (`subagent_type: architect`, agentId `aff4586d0163c3514`)
- 設計ドキュメント 4 件を `agent-docs/` に新規作成
  - `phase-2-architecture.md` (133 行): 全体設計概要
  - `phase-2-status-enum.md`: status 4 値の Rust ホワイトリスト + TS 型方針
  - `agent-duplicate-design.md`: `agent_duplicate` command 設計 + memory 非引継ぎ実装
  - `phase-2-ui-design.md`: LeftSidebar 統合 / status バッジ / 複製確認 UI
- フェーズ計画 `tasks/phases.md` (91 行) を新規作成: 2A → 2B → 2C → 2D の依存フロー
- 22 Implement チケット (本体 22 + done_when 22 = 44 ファイル) を `tasks/phase-2{A,B,C,D}/` に配置
  - Phase 2A: 6 (backend: status enum + agent_duplicate)
  - Phase 2B: 6 (frontend foundation: bindings + service + store + tokens)
  - Phase 2C: 7 (UI enhancement: status badge + LeftSidebar 統合)
  - Phase 2D: 3 (duplicate UI + 結合 smoke)
- チケット本体には `done_when` を転載していないことを確認 (`task-2A01.md` 81 行 / `task-2A01.done_when.md` 27 行 で完全分離)

## In Progress

- なし

## Not Started

- Phase 2.5 (チケット登録): 22 Implement + 4 Evaluate (Phase 2A/B/C/D 各 1) を TaskCreate
- Phase 7 の blockedBy に全 Evaluate タスク ID を追加

## Failed Tests / Known Issues

- なし (設計フェーズ)

## Key Decisions (architect 報告より抜粋)

1. **status enum**: Rust 側 `&'static str` ホワイトリスト + `validate_agent_status` 関数 (本格 enum 化は QTM-009)
2. **TS 側型**: `Agent.status` は `AgentStatus | string` ユニオンで前方互換維持
3. **memory 非引継ぎ**: 「memory テーブルに INSERT を書かない」ことを Rust 単体テストの COUNT 不変で検証
4. **複製 UI**: modal portal 不使用、inline `<aside role="alertdialog">` (ESC 対応のみ)
5. **`selectedAgentId`**: OverviewTab ローカル state から `uiStore` に昇格 (LeftSidebar / Overview 連動)
6. **tokens.css**: `--color-danger` + red 3 階調を新規追加 (raw 色値直書き禁止を Phase 1 から継承)
7. **zustand 安定参照**: `EMPTY_AGENTS` パターンを LeftSidebar にも適用 (Phase 1F task-1F06 回帰防止)

## Next Step

- Phase 2.5: 22 Implement チケットを TaskCreate (各 metadata に `ticket` / `phase` / `done_when_path` を設定、`addBlockedBy` でチケット間依存と Phase 2.5 タスク #3 への依存を設定)
- Phase 2A/2B/2C/2D 各 Evaluate タスク 4 件を TaskCreate
- Phase 7 (タスク #4) の `addBlockedBy` に全 4 Evaluate タスク ID を追加

## Files Changed

- agent-docs/phase-2-architecture.md (新規)
- agent-docs/phase-2-status-enum.md (新規)
- agent-docs/agent-duplicate-design.md (新規)
- agent-docs/phase-2-ui-design.md (新規)
- tasks/phases.md (新規, Phase 2 計画)
- tasks/phase-2A/task-2A01..06.md + .done_when.md (12 ファイル)
- tasks/phase-2B/task-2B01..06.md + .done_when.md (12 ファイル)
- tasks/phase-2C/task-2C01..07.md + .done_when.md (14 ファイル)
- tasks/phase-2D/task-2D01..03.md + .done_when.md (6 ファイル)
- agent-output/phase-2-architecture-status.md (本ファイル)
